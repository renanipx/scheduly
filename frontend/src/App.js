import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import GoogleAuthHandler from './pages/auth/GoogleAuthHandler';
import Tasks from './pages/dashboard/Tasks';
import Calendar from './pages/dashboard/Calendar';
import Settings from './pages/dashboard/Settings';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import './assets/App.css';
import './assets/AIAssistant.css';
import { useUser } from './context/UserContext';

function App() {
  const { user, loading } = useUser();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        let theme = localStorage.getItem('theme');
        if (user.theme) {
          theme = user.theme;
          localStorage.setItem('theme', theme);
        }
        if (theme === 'dark') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/auth/google" element={<GoogleAuthHandler />} />
          <Route path="/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
          <Route path="/calendar" element={<DashboardLayout><Calendar /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 