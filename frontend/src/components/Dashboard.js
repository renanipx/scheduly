import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Here you would typically clear any auth tokens
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      <main className="dashboard-content">
        <h2>Welcome to your Dashboard</h2>
        <p>This is a protected page that you can only see after logging in.</p>
      </main>
    </div>
  );
}

export default Dashboard; 