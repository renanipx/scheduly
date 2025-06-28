import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/Auth.css';
import { useUser } from '../../context/UserContext';

function GoogleAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  useEffect(() => {    
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      navigate('/login', { state: { error: 'Google authentication failed' } });
      return;
    }
    
    if (token) {
      localStorage.setItem('token', token);
      // Fetch user profile and set in context
      fetch(process.env.REACT_APP_BACKEND_URL + '/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(user => {
          setUser(user);
          navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          setUser(null);
          navigate('/login', { state: { error: 'Failed to fetch user info' } });
        });
    } else {
      navigate('/login', { state: { error: 'Token not received from Google' } });
    }
  }, [location, navigate, setUser]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>Authenticating with Google...</div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        Please wait while we process your authentication...
      </div>
    </div>
  );
}

export default GoogleAuthHandler; 