import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios'; // Import axios for API calls
import './ChatBot.css'; // Import the new CSS file
import { AuthContext } from '../../Context/AuthContext';
// Main Chatbot component
const ChatBot = () => {
  const { role, user, isLoggedIn, userId } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false); // New state for loading indicator
  const messagesEndRef = useRef(null);

  // Define your backend URL // IMPORTANT: Change this to your actual backend URL

// const userId = user ? user.id : null;
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message from the bot
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        text: "Hello! I'm your ShopBot. I can help you with order tracking, finding product details, checking your recent orders, and more. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsBotTyping(true); // Show typing indicator

    try {
      const token = localStorage.getItem('token');

      // Send the user's message to your backend chatbot API
      const response = await axios.post(`http://localhost:8080/api/chatbot`, {
        message: newUserMessage.text,
        userId: userId,
        token: token,
      });
      console.log(newUserMessage.text, userId);

      const botResponse = response.data.reply || "I'm sorry, I couldn't get a clear response.";

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } catch (error) {
      console.error('Error sending message to backend:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          text: "Oops! Something went wrong. Please try again later or contact support.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } finally {
      setIsBotTyping(false); // Hide typing indicator
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container-wrapper">
      <div className="chatbot-container">
        {/* Chat header */}
        <div className="chatbot-header">
          <h1 className="chatbot-title">ShopBot</h1>
        </div>

        {/* Messages display area */}
        <div className="chatbot-messages-area custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.sender === 'user' ? 'user-message-row' : 'bot-message-row'}`}
            >
              <div
                className={`message-bubble ${msg.sender === 'user' ? 'user-message-bubble' : 'bot-message-bubble'}`}
              >
                <p className="message-text">{msg.text}</p>
                <span className="message-timestamp">
                  {msg.timestamp}
                </span>
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
          <div ref={messagesEndRef} /> {/* Empty div to scroll to */}
        </div>

        {/* Message input area */}
        <div className="chatbot-input-area">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="message-input"
            disabled={isBotTyping} // Disable input while bot is typing
          />
          <button
            onClick={handleSendMessage}
            className="send-button"
            disabled={isBotTyping || inputMessage.trim() === ''} // Disable button while typing or input is empty
          >
            {/* Send icon (inline SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="send-icon"
            >
              <path d="m22 2-7 20-4-9-9-4 20-7Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
