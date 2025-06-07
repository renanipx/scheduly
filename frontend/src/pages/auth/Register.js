import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import logo from '../../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(process.env.REACT_APP_RECAPTCHA_BACKEND + 'register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      // navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="close-button" onClick={() => navigate('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="logo-container">
          <img src={logo} alt="Chronoly" className="auth-logo" />
        </div>

        <h2 className="auth-title register-title">Create Account</h2>
        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              className="modern-input"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              className="modern-input"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              className="modern-input"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              className="modern-input"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 