// src/Pages/Payment/Payment.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../Context/CartContext"; // if you want to use cart info
import "./Payment.css"; // optional: create for styling or remove

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5174";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Razorpay SDK failed to load. Check network."));
    document.body.appendChild(script);
  });

export default function Payment() {
  const [loading, setLoading] = useState(false);
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
          }
        },
        modal: {
          ondismiss: function () {
            // called when user closes the checkout modal
            console.log("Razorpay checkout closed");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (res) {
        console.error("payment.failed:", res);
        alert(res?.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong while initiating payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page" style={{ padding: 20 }}>
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
    </div>
  );
}
