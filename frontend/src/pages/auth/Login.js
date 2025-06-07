import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import './Auth.css';
import logo from '../../assets/logo.png';

function Login() {
  console.log('V3 Key:', process.env.REACT_APP_RECAPTCHA_SITE_KEY_V3);
  console.log('V2 Key:', process.env.REACT_APP_RECAPTCHA_SITE_KEY_V2);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState('');
  const [showV2Captcha, setShowV2Captcha] = useState(false);
  const [isV3Available, setIsV3Available] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load reCAPTCHA v3 script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.REACT_APP_RECAPTCHA_SITE_KEY_V3}`;
    
    script.onload = async () => {
      try {
        console.log(process.env.REACT_APP_RECAPTCHA_SITE_KEY_V3);
        const token = await window.grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY_V3, { action: 'login' });
        if (token) {
          setIsV3Available(true);
        } else {
          setShowV2Captcha(true);
        }
      } catch (error) {
        console.error('reCAPTCHA v3 error:', error);
        setShowV2Captcha(true);
      }
    };

    script.onerror = () => {
      console.error('Failed to load reCAPTCHA v3');
      setShowV2Captcha(true);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const executeV3Recaptcha = async () => {
    if (!isV3Available) {
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY_V3, { action: 'login' });
      return token;
    } catch (error) {
      console.error('reCAPTCHA v3 error:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Try V3 first if available
      const v3Token = isV3Available ? await executeV3Recaptcha() : null;
      
      if (!v3Token && !showV2Captcha) {
        setShowV2Captcha(true);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        recaptchaToken: v3Token || recaptchaToken
      });

      if (response.data.message === 'Login successful') {
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

  const handleV2CaptchaChange = async (token) => {
    if (!token) return;
    setRecaptchaToken(token);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        recaptchaToken: token
      });

      if (response.data.message === 'Login successful') {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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

        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}

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
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login; 