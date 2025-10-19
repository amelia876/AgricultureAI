import React, { useState, useRef, useEffect } from 'react';
import './MessageBot.css';

const MessageBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AgricultureAI assistant. How can I help you with farming today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample agriculture responses
  const botResponses = [
    "Based on your location and soil type, I'd recommend planting corn or soybeans this season.",
    "For pest control in your area, consider using neem oil or introducing beneficial insects like ladybugs.",
    "The optimal planting time for your crops would be between April 15th and May 10th.",
    "Your soil pH seems a bit low. I recommend adding lime to balance it for better crop growth.",
    "Based on weather forecasts, you should consider irrigating your fields in the next 3 days.",
    "For crop rotation, I suggest following corn with legumes to improve soil nitrogen levels.",
    "The current market prices for your crops are favorable. Consider selling in 2-3 weeks.",
    "I detect possible nutrient deficiency. Have you considered a soil test recently?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate bot thinking and response
    setTimeout(() => {
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="messagebot-container">
      {/* Header */}
      <div className="chat-header">
        <div className="bot-avatar">
          <span className="avatar-icon">🤖</span>
        </div>
        <div className="bot-info">
          <h3>AgricultureAI Assistant</h3>
          <p>Online • Ready to help</p>
        </div>
        <div className="header-actions">
          <button className="action-btn">⋮</button>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="quick-questions">
        <p>Quick questions:</p>
        <div className="question-chips">
          <button 
            className="question-chip"
            onClick={() => handleQuickQuestion("What should I plant this season?")}
          >
            🌱 Planting advice
          </button>
          <button 
            className="question-chip"
            onClick={() => handleQuickQuestion("Pest control recommendations?")}
          >
            🐛 Pest control
          </button>
          <button 
            className="question-chip"
            onClick={() => handleQuickQuestion("Soil health tips?")}
          >
            🌿 Soil health
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.sender === 'bot' && (
              <div className="message-avatar">
                <span>🤖</span>
              </div>
            )}
            <div className="message-content">
              <div className="message-bubble">
                <p>{message.text}</p>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
            {message.sender === 'user' && (
              <div className="message-avatar user-avatar">
                <span>👤</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <div className="message-avatar">
              <span>🤖</span>
            </div>
            <div className="message-content">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="input-container" onSubmit={handleSendMessage}>
        <div className="input-wrapper">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about crops, weather, soil, or market prices..."
            className="message-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputMessage.trim() || isLoading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageBot;