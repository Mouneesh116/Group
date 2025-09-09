// src/components/ChatBot/ChatBot.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import "./ChatBot.css";
import { AuthContext } from "../../Context/AuthContext";

const ChatBot = () => {
  const { userId } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Adjust this base URL as needed for your environment
  const API_BASE = "http://localhost:8080";

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // initial welcome
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        text: "Hello! I'm your ShopBot. Choose an option below or type your question:",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  // send a message to backend chatbot endpoint
  const sendMessageToBackend = async (messageText) => {
    if (!messageText || messageText.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // optimistic add user message
    setMessages((prev) => [...prev, userMessage]);
    setIsBotTyping(true);
    setInputValue("");

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const resp = await axios.post(
        `${API_BASE}/api/chatbot`,
        { message: messageText, userId: userId, token },
        { headers }
      );

      const replyText = resp?.data?.reply ?? "I'm sorry, I couldn't get a clear response.";
      const orders = resp?.data?.orders ?? null;
      const cart = resp?.data?.cart ?? null;
      const rawCart = resp?.data?.rawCart ?? null;
      const subtotal = resp?.data?.subtotal ?? null;
      const intent = resp?.data?.intent ?? null;

      // append bot message with structured payloads if any
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (orders) botMessage.orders = orders;
      if (cart) botMessage.cart = cart;
      if (rawCart) botMessage.rawCart = rawCart;
      if (subtotal !== undefined) botMessage.subtotal = subtotal;
      if (intent) botMessage.intent = intent;

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message to backend:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: "Oops! Something went wrong. Please try again later.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Quick options
  const quickOptions = [
    { id: "track", label: "Track My Order", message: "track order" },
    { id: "recent", label: "My Recent Orders", message: "my orders" },
    { id: "cart", label: "My Cart", message: "my cart" },
    { id: "faq1", label: "Return Policy", message: "return policy" },
    { id: "faq2", label: "Shipping Costs", message: "shipping cost" },
    { id: "faq3", label: "Payment Methods", message: "payment methods" },
    { id: "hello", label: "Say Hello 👋", message: "hello" },
  ];

  // order selection button clicked
  const handleSelectOrder = (orderId) => {
    if (!orderId) return;
    sendMessageToBackend(`track order ${orderId}`);
  };

  // checkout clicked
  const handleCheckout = () => {
    sendMessageToBackend("checkout");
  };

  // remove cart item at index (1-based index)
  const handleRemoveCartItem = (index) => {
    if (!index) return;
    sendMessageToBackend(`remove ${index}`);
  };

  // submit input
  const handleSend = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    sendMessageToBackend(text);
  };

  return (
    <div className="chatbot-container-wrapper">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h1 className="chatbot-title">ShopBot</h1>
        </div>

        <div className="chatbot-messages-area custom-scrollbar" aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.sender === "user" ? "user-message-row" : "bot-message-row"}`}
            >
              <div className={`message-bubble ${msg.sender === "user" ? "user-message-bubble" : "bot-message-bubble"}`}>
                <p className="message-text" style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
                <span className="message-timestamp">{msg.timestamp}</span>

                {/* Orders list for selection */}
                {msg.sender === "bot" && Array.isArray(msg.orders) && msg.orders.length > 0 && (
                  <div className="orders-list">
                    <p className="orders-list-heading">Select an order:</p>
                    {msg.orders.map((o, idx) => (
                      <button
                        key={o.id}
                        className="order-select-button"
                        onClick={() => handleSelectOrder(o.id)}
                        disabled={isBotTyping}
                        title={`Order id: ${o.id}`}
                      >
                        {idx + 1}. {o.itemsSummary || o.items || "No items"} — {o.status} — ${o.totalAmount} — {o.orderedAt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Normalized cart rendering */}
                {msg.sender === "bot" && Array.isArray(msg.cart) && msg.cart.length > 0 && (
                  <div className="orders-list">
                    <p className="orders-list-heading">Your cart</p>
                    {msg.cart.map((c, i) => (
                      <div key={c.id || i} className="cart-item">
                        <div className="cart-item-left">
                          <div className="cart-item-title">{c.title}</div>
                          <div className="cart-item-meta">{c.qty} × {c.price != null ? `$${c.price}` : "N/A"}{c.lineTotal != null ? ` = $${c.lineTotal.toFixed(2)}` : ""}</div>
                        </div>
                        <div className="cart-item-actions">
                          <button
                            className="cart-remove-button"
                            onClick={() => handleRemoveCartItem(c.idx ?? (i + 1))}
                            disabled={isBotTyping}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="cart-subtotal">Subtotal: ${typeof msg.subtotal === "number" ? msg.subtotal.toFixed(2) : msg.subtotal}</div>

                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <button className="quick-option-button" onClick={handleCheckout} disabled={isBotTyping}>Checkout</button>
                      <button className="quick-option-button" onClick={() => sendMessageToBackend("save cart")} disabled={isBotTyping}>Save Cart</button>
                    </div>
                  </div>
                )}

                {msg.sender === "bot" && (!Array.isArray(msg.cart) || msg.cart.length === 0) && (!Array.isArray(msg.rawCart) || msg.rawCart.length === 0) && msg.text && msg.text.toLowerCase().includes("cart is empty") && (
                  <div style={{ marginTop: 8, opacity: 0.9, fontSize: 13 }}>
                    Tip: If you added items while logged out they may be in localStorage. Log in and use "Save Cart" on the site to persist them.
                  </div>
                )}
              </div>
            </div>
          ))}

          {isBotTyping && (
            <div className="message-row bot-message-row">
              <div className="message-bubble bot-message-bubble typing-indicator-bubble">
                <div className="typing-indicator">
                  <span className="dot dot1">.</span>
                  <span className="dot dot2">.</span>
                  <span className="dot dot3">.</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input + quick buttons */}
        <div className="chatbot-input-area">
          <form onSubmit={handleSend} className="chatbot-input-form" style={{ flex: 1, display: "flex", gap: 8 }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message or pick an option..."
              disabled={isBotTyping}
              className="chatbot-text-input"
              aria-label="Chat message"
            />
            <button type="submit" className="chatbot-send-button" disabled={isBotTyping}>Send</button>
          </form>

          <div className="chatbot-buttons-area" style={{ marginTop: 8 }}>
            {quickOptions.map(opt => (
              <button
                key={opt.id}
                className="quick-option-button"
                onClick={() => sendMessageToBackend(opt.message)}
                disabled={isBotTyping}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
