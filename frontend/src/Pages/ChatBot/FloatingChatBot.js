import React, { useState } from 'react';
import ChatBot from './ChatBot'; // Adjust the path if needed
import './FloatingChatBot.css'; // Import the CSS for styling

const FloatingChatBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <div className="floating-chatbot-container">
      {/* Floating button */}
      <button className="floating-chatbot-button" onClick={toggleChat}>
        {isChatOpen ? (
          <span>&times;</span> // Close icon
        ) : (
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
            className="chat-icon"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10" />
            <path d="M17 2v4" />
            <path d="M21 2v4" />
          </svg>
        )}
      </button>

      {/* Chatbot popup */}
      {isChatOpen && (
        <div className="chatbot-popup">
          <ChatBot />
        </div>
      )}
    </div>
  );
};

export default FloatingChatBot;