import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Login successful - redirect to admin dashboard
      navigate("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      default:
        return "Login failed. Please check your credentials and try again.";
    }
  };

  return (
    <div className="login-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2>🌱 AgricultureAI</h2>
        </div>
        <div className="nav-links">
          <button 
            className="nav-btn secondary-nav-btn"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </nav>

      {/* Login Form Section */}
      <div className="login-content">
        <div className="login-form-container">
          <div className="login-form">
            <div className="form-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your AgricultureAI account</p>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  Remember me
                </label>
                <a href="#forgot" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="divider">
              <span>New to AgricultureAI?</span>
            </div>

            <div className="auth-link">
              Don't have an account? <Link to="/signup" className="link">Sign up here</Link>
            </div>
          </div>
        </div>

        {/* Login Illustration */}
        <div className="login-illustration">
          <div className="illustration-content">
            <div className="floating-element element-1">
              🌾
            </div>
            <div className="floating-element element-2">
              🤖
            </div>
            <div className="floating-element element-3">
              📊
            </div>
            <h2>Smart Farming Awaits</h2>
            <p>Access your personalized dashboard with AI-powered insights and recommendations for your farm.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;