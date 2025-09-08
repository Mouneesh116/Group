<<<<<<< HEAD
// src/Pages/Payment/Payment.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../Context/CartContext"; // if you want to use cart info
import "./Payment.css"; // optional: create for styling or remove

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5174";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
=======
import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../../Context/CartContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./Payment.css";

const API_BASE = "http://localhost:8080"; 
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || ""; // your Razorpay key id (publishable)
>>>>>>> 7bb563c26169846b02b9c754e8356a2fe7adbfff

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
<<<<<<< HEAD
    script.onerror = () =>
      reject(new Error("Razorpay SDK failed to load. Check network."));
=======
    script.onerror = () => reject(new Error("Razorpay SDK failed to load. Check network."));
>>>>>>> 7bb563c26169846b02b9c754e8356a2fe7adbfff
    document.body.appendChild(script);
  });

export default function Payment() {
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const navigate = useNavigate();
  
  let cart = null;
  try {
    // only if you have cart context
    const ctx = useContext(CartContext);
    cart = ctx?.items || null;
  } catch (e) {
    // ignore if CartContext import path differs
  }

  // Force amount to ₹2 for demo/testing
  const forcedAmountInRupees = 2;

  const onPayClicked = async () => {
    setLoading(true);
    try {
      await loadRazorpayScript();

      // create order on backend (rupees)
      const createRes = await fetch(`${API_BASE}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInRupees: forcedAmountInRupees,
          receiptNotes: { source: "react-checkout", cartId: cart?.id ?? null }
        })
      });

      if (!createRes.ok) {
        const txt = await createRes.text().catch(() => null);
        throw new Error(`Order creation failed: ${createRes.status} ${txt || ""}`);
      }

      const order = await createRes.json();
      if (!order?.id) throw new Error("Order creation returned no id");

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount, // in paise
        currency: order.currency || "INR",
        name: "My Demo Store",
        description: `Demo checkout — ₹${forcedAmountInRupees}`,
        order_id: order.id,
        prefill: {
          name: "", // put actual user name if you have it
          email: "",
          contact: ""
        },
        handler: async function (response) {
          // verify on backend
          try {
            const verifyRes = await fetch(`${API_BASE}/api/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            });
            const verify = await verifyRes.json();
            if (verify.ok) {
              alert("Payment successful! Payment id: " + response.razorpay_payment_id);
              // TODO: update order state / DB or navigate to success page
              navigate("/profile"); // or anywhere you want
            } else {
              alert("Payment verification failed. Please contact support.");
              console.error("verify response", verify);
            }
          } catch (err) {
            console.error("verification error", err);
            alert("Verification error");
=======
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
>>>>>>> 7bb563c26169846b02b9c754e8356a2fe7adbfff
          }
        },
        modal: {
          ondismiss: function () {
<<<<<<< HEAD
            // called when user closes the checkout modal
            console.log("Razorpay checkout closed");
          }
        }
=======
            console.log("Razorpay checkout closed");
          },
        },
>>>>>>> 7bb563c26169846b02b9c754e8356a2fe7adbfff
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (res) {
        console.error("payment.failed:", res);
<<<<<<< HEAD
        alert(res?.error?.description || "Payment failed");
=======
        toast.error(res?.error?.description || "Payment failed");
>>>>>>> 7bb563c26169846b02b9c754e8356a2fe7adbfff
      });
      rzp.open();
    } catch (err) {
      console.error(err);
<<<<<<< HEAD
      alert(err.message || "Something went wrong while initiating payment");
=======
      toast.error(err.message || "Something went wrong while initiating payment");
>>>>>>> 7bb563c26169846b02b9c754e8356a2fe7adbfff
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page" style={{ padding: 20 }}>
<<<<<<< HEAD
      <h2>Checkout (Demo)</h2>
      <p>
        For testing/demo the checkout will charge <strong>₹{forcedAmountInRupees}</strong> only.
      </p>

      {/* show cart summary optionally */}
      {cart && (
        <div style={{ marginBottom: 12 }}>
          <h4>Cart items: {cart.length}</h4>
          {/* render small list if needed */}
        </div>
      )}

      <button
        onClick={onPayClicked}
        disabled={loading}
        style={{ padding: "10px 14px", fontSize: 16 }}
      >
        {loading ? "Processing…" : `Pay ₹${forcedAmountInRupees}`}
      </button>

      <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
        Make sure your backend is running and CORS allows requests from this origin.
      </p>
=======
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
>>>>>>> 7bb563c26169846b02b9c754e8356a2fe7adbfff
    </div>
  );
}
