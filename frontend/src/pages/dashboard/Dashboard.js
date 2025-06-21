import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Calendar from './Calendar';
import Tasks from './Tasks';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Debug log when component mounts
  React.useEffect(() => {    
    
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem('token');    
    
    if (!token) {    
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src="/logo.svg" alt="Chronoly" className="sidebar-logo" />
          <button 
            className="toggle-sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <a href="#dashboard">
                <i className="fas fa-home"></i>
                {isSidebarOpen && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a href="#calendar">
                <i className="fas fa-calendar"></i>
                {isSidebarOpen && <span>Calendar</span>}
              </a>
            </li>
            <li>
              <a href="#tasks">
                <i className="fas fa-tasks"></i>
                {isSidebarOpen && <span>Tasks</span>}
              </a>
            </li>
            <li>
              <a href="#settings">
                <i className="fas fa-cog"></i>
                {isSidebarOpen && <span>Settings</span>}
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search..." />
          </div>
          <div className="header-actions">
            <button className="notification-button">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            <div className="user-profile">
              <img src="/default-avatar.png" alt="User" />
              <span>John Doe</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="welcome-section">
            <h1>Welcome back, John!</h1>
            <p>Here's what's happening with your projects today.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="stat-info">
                <h3>Total Tasks</h3>
                <p>24</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-info">
                <h3>Completed</h3>
                <p>12</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <h3>In Progress</h3>
                <p>8</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="stat-info">
                <h3>Pending</h3>
                <p>4</p>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <Tasks />
            </div>
            <div className="dashboard-card">
              <Calendar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 