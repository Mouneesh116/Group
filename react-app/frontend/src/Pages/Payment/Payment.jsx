import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../../Context/CartContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./Payment.css";

const API_BASE = "http://localhost:8080"; 
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || ""; // your Razorpay key id (publishable)


const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay SDK failed to load. Check network."));
    document.body.appendChild(script);
  });

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setCartItems } = useContext(CartContext) || {};
  const token = localStorage.getItem("token");

  // order payload passed from ShoppingCart via navigate(..., { state: { orderPayload }})
  const orderPayload = location?.state?.orderPayload ?? null;

  useEffect(() => {
    if (!orderPayload) {
      toast.error("No order data found. Please try again from cart.");
      navigate("/cart");
    }
  }, [orderPayload, navigate]);

  const onPayClicked = async () => {
    if (!orderPayload) return;
    setLoading(true);

    try {
      await loadRazorpayScript();
      const amountInPaise = Math.round(orderPayload.totalAmount * 100);
      const createRes = await axios.post(
        `${API_BASE}/api/create-order`,
        { amountInPaise, receiptNotes: { source: "react-checkout", userId: orderPayload.userId } },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (!createRes.data || !createRes.data.id) {
        throw new Error("Order creation on backend failed");
      }

      const razorpayOrder = createRes.data; // { id, amount, currency }

      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "My Demo Store",
        description: `Order payment — ₹${(razorpayOrder.amount / 100).toFixed(2)}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${API_BASE}/api/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            if (!verifyRes.data || !verifyRes.data.ok) {
              toast.error("Payment verification failed. Please contact support.");
              console.error("verify response", verifyRes.data);
              return;
            }

            // create final order in backend
            const orderCreationPayload = {
              ...orderPayload,
              paymentInfo: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              },
              status: "Paid",
            };

            const orderResp = await axios.post(
              `${API_BASE}/api/orders/add`,
              orderCreationPayload,
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            if (orderResp.status === 200 || orderResp.status === 201) {
              // clear cart on backend
              try {
                await axios.delete(`${API_BASE}/api/users/cart/remove/${orderPayload.userId}`, {
                  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
              } catch (err) {
                console.warn("Failed to clear cart on backend:", err);
              }

              // clear frontend cart
              if (typeof setCartItems === "function") setCartItems([]);

              toast.success("Payment successful and order placed!");
              navigate("/profile");
            } else {
              toast.error(orderResp.data?.message || "Order creation after payment failed.");
              console.error("orderResp", orderResp);
            }
          } catch (err) {
            console.error("verification/order error", err);
            toast.error(err?.response?.data?.message || "Payment verification/ordering failed.");
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout closed");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (res) {
        console.error("payment.failed:", res);
        toast.error(res?.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong while initiating payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page" style={{ padding: 20 }}>
      <h2>Checkout</h2>

      {orderPayload && (
        <>
          <div style={{ marginBottom: 12 }}>
            <h4>Amount to pay: ₹{orderPayload.totalAmount.toFixed(2)}</h4>
            <p>Items: {orderPayload.items.length}</p>
            <p>Shipping: {orderPayload.shippingAddress}</p>
          </div>

          <button onClick={onPayClicked} disabled={loading} style={{ padding: "10px 14px", fontSize: 16 }}>
            {loading ? "Processing…" : `Pay ₹${orderPayload.totalAmount.toFixed(2)}`}
          </button>
        </>
      )}
    </div>
  );
}
