import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import logo from '../assets/logo.png';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', {
        email
      });

      setMessage('Password reset instructions have been sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button className="close-button" onClick={() => navigate('/login')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="form-title">Reset Password</h2>
          <p className="form-description">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="modern-input"
            />
          </div>

          <button type="submit" className="login-button">
            Send Reset Instructions
          </button>

          <div className="auth-links">
            Remember your password? <Link to="/login">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword; 