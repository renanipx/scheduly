import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import './Auth.css';
import logo from '../../assets/logo.svg';

function Login() {
  const [email, setEmail] = useState(useLocation().state?.email || '');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState('');
  const [showV2Captcha, setShowV2Captcha] = useState(false);
  const [isV3Available, setIsV3Available] = useState(false);
  const [isV2Checked, setIsV2Checked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle errors from GoogleAuthHandler
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  useEffect(() => {
    const loadRecaptchaScript = () => {
      return new Promise((resolve, reject) => {
        if (window.grecaptcha && window.grecaptcha.execute) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.REACT_APP_RECAPTCHA_SITE_KEY_V3}`;
        
        script.onload = () => {
          setTimeout(() => {
            if (window.grecaptcha && window.grecaptcha.execute) {
              resolve();
            } else {
              reject(new Error('reCAPTCHA not loaded properly'));
            }
          }, 1000);
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load reCAPTCHA'));
        };

        document.body.appendChild(script);
      });
    };

    const initializeRecaptcha = async () => {
      try {
        await loadRecaptchaScript();
        const token = await window.grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY_V3, { action: 'login' });
        if (token) {
          try {
            const response = await axios.post(process.env.REACT_APP_RECAPTCHA_SITE_VERIFY, { token });
            
            if (response.data.success && response.data.score >= 0.5) {
              setIsV3Available(true);
              setRecaptchaToken(token);
            } else {
              setShowV2Captcha(true);
            }
          } catch (error) {
            setShowV2Captcha(true);
          }
        } else {
          setShowV2Captcha(true);
        }
      } catch (error) {
        setShowV2Captcha(true);
      }
    };

    initializeRecaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (showV2Captcha && !isV2Checked) {
      setError('Please verify that you are not a robot');
      return;
    }

    try {
      const payload = {
        email,
        password
      };

      const response = await axios.post(process.env.REACT_APP_RECAPTCHA_BACKEND +'login', payload);

      if (response.data.message === 'Login successful') {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 400 && !showV2Captcha) {
        setShowV2Captcha(true);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    }
  };

  const handleV2CaptchaChange = (token) => {
    setIsV2Checked(!!token);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src={logo} alt="Chronoly" className="auth-logo" />
        </div>

        <h2 className="auth-title login-title">Sign In</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="social-login-container">
          <button
            type="button"
            className="google-login-button"
            onClick={() => {
              window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`;
            }}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, marginRight: 8 }} />
            Sign in with Google
          </button>
          <div className="separator">
            <span>or</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              className="modern-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="modern-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {showV2Captcha && (
            <div className="form-group">
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY_V2}
                onChange={handleV2CaptchaChange}
                size="normal"
                theme="light"
              />
            </div>
          )}

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Forgot Password?
          </Link>
          <Link to="/register" className="auth-link register-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login; 