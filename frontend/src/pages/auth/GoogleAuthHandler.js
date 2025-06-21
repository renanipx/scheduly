import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function GoogleAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();

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
      navigate('/dashboard', { replace: true });
    } else {
      
      navigate('/login', { state: { error: 'Token not received from Google' } });
    }
  }, [location, navigate]);

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