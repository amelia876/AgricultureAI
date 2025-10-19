import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("Starting signup process...");
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      console.log("Firebase Auth user created:", user.uid);

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email.toLowerCase().trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        createdAt: serverTimestamp(), // Use serverTimestamp for consistency
        updatedAt: serverTimestamp(),
        profileCompleted: true,
        emailVerified: user.emailVerified,
        lastLogin: serverTimestamp()
      });

      console.log("Firestore user document created successfully");
      
      // Redirect to FarmerDashboard
      navigate("/farmer-dashboard");

    } catch (err) {
      console.error("Signup error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please use a different email or login.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/operation-not-allowed":
        return "Email/password authentication is not enabled. Please contact support.";
      case "permission-denied":
        return "Database permission denied. Please make sure Firestore is set up correctly.";
      default:
        return `Signup failed: ${errorCode}. Please try again.`;
    }
  };

  return (
    <div className="signup-container-simple">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2>🌱 YaadWise</h2>
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

      {/* Centered Signup Form */}
      <div className="signup-center">
        <div className="signup-form-simple">
          <div className="form-header">
            <h1>Create Your Account</h1>
            <p>Join AgricultureAI to get started with smart farming</p>
          </div>
          
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <form onSubmit={handleSignup}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your first name"
                  className="form-input"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your last name"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
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
              <label htmlFor="role">I am a: *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
              >
                <option value="farmer">Farmer</option>
                <option value="agriculture-expert">Agriculture Expert</option>
                <option value="researcher">Researcher</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password (min 6 characters)"
                className="form-input"
                disabled={loading}
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="form-input"
                disabled={loading}
                minLength="6"
              />
            </div>

            <div className="form-terms">
              <label className="terms-label">
                <input type="checkbox" required />
                <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></span>
              </label>
            </div>

            <button 
              type="submit" 
              className="signup-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-link">
            Already have an account? <Link to="/login" className="link">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;