import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2>🌱 YaadWise</h2>
        </div>
        <div className="nav-links">
          <button 
            className="nav-btn login-btn"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="nav-btn signup-btn"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Revolutionize Your Farming with 
              <span className="highlight"> AI Technology</span>
            </h1>
            <p className="hero-description">
              Get intelligent insights, crop recommendations, and yield predictions 
              powered by artificial intelligence. Join thousands of farmers who are 
              transforming agriculture with data-driven decisions.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn primary-btn"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
              </button>
              <button 
                className="btn secondary-btn"
                onClick={() => navigate('/login')}
              >
                Existing User? Login
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <div className="floating-card card-1">
                🌾 Smart Farming
              </div>
              <div className="floating-card card-2">
                🤖 AI Insights
              </div>
              <div className="floating-card card-3">
                📊 Analytics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Why Choose AgricultureAI?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌡️</div>
              <h3>Weather Analytics</h3>
              <p>Get precise weather predictions and recommendations for your crops</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧪</div>
              <h3>Soil Analysis</h3>
              <p>AI-powered soil health monitoring and fertilizer recommendations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Yield Prediction</h3>
              <p>Accurate yield forecasts to optimize your harvest planning</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Market Insights</h3>
              <p>Real-time market prices and demand predictions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Transform Your Farming?</h2>
          <p>Join thousands of farmers using AI to increase yields and reduce costs</p>
          <div className="cta-buttons">
            <button 
              className="btn primary-btn large"
              onClick={() => navigate('/signup')}
            >
              Start Your Journey Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 AgricultureAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;