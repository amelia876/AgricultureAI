// MessageBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import './MessageBot.css';
import cors from "cors";


const MessageBot = () => {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text: "Hello! I'm your AgricultureAI assistant. How can I help you with farming today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call your Express backend
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text })
      });

      console.log(response)

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.response || "Sorry, I couldn’t understand that.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "⚠️ Sorry, there was an error reaching the server.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

 const handleQuickQuestion = (question) => {
  // Just set the input and let user send it manually
  setNewMessage(question);
  // Optional: Auto-focus the input
  if (inputRef.current) {
    inputRef.current.focus();
  }
};

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="messagebot-container">
      {/* Header */}
      <div className="chat-header">
        <div className="bot-avatar">🤖</div>
        <div className="bot-info">
          <h3>AgricultureAI Assistant</h3>
          <p>Online • Ready to help</p>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="quick-questions">
        <p>Quick questions:</p>
        <div className="question-chips">
          <button className="question-chip" onClick={() => handleQuickQuestion("What should I plant this season?")}>
            🌱 Planting advice
          </button>
          <button className="question-chip" onClick={() => handleQuickQuestion("Pest control recommendations?")}>
            🐛 Pest control
          </button>
          <button className="question-chip" onClick={() => handleQuickQuestion("Soil health tips?")}>
            🌿 Soil health
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}-message`}>
            {msg.sender === 'bot' && <div className="message-avatar">🤖</div>}
            <div className="message-content">
              <div className="message-bubble">
                <p>{msg.text}</p>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
            {msg.sender === 'user' && <div className="message-avatar user-avatar">👤</div>}
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-bubble">
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <form className="input-container" onSubmit={handleSendMessage}>
        <div className="input-wrapper">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Ask about crops, weather, soil, or market prices..."
            disabled={isLoading}
          />
          <button type="submit" disabled={!inputMessage.trim() || isLoading}>Send</button>
        </div>
      </form>
    </div>
  );
};

export default MessageBot;
