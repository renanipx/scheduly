import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="Chronoly" className="sidebar-logo" />
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
              <a href="#projects">
                <i className="fas fa-project-diagram"></i>
                {isSidebarOpen && <span>Projects</span>}
              </a>
            </li>
            <li>
              <a href="#team">
                <i className="fas fa-users"></i>
                {isSidebarOpen && <span>Team</span>}
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
              <h2>Recent Tasks</h2>
              <div className="task-list">
                <div className="task-item">
                  <input type="checkbox" id="task1" />
                  <label htmlFor="task1">Complete project proposal</label>
                  <span className="task-date">Today</span>
                </div>
                <div className="task-item">
                  <input type="checkbox" id="task2" />
                  <label htmlFor="task2">Review team updates</label>
                  <span className="task-date">Tomorrow</span>
                </div>
                <div className="task-item">
                  <input type="checkbox" id="task3" />
                  <label htmlFor="task3">Schedule client meeting</label>
                  <span className="task-date">Next Week</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Upcoming Events</h2>
              <div className="event-list">
                <div className="event-item">
                  <div className="event-date">
                    <span className="day">15</span>
                    <span className="month">Mar</span>
                  </div>
                  <div className="event-details">
                    <h4>Team Meeting</h4>
                    <p>10:00 AM - 11:00 AM</p>
                  </div>
                </div>
                <div className="event-item">
                  <div className="event-date">
                    <span className="day">16</span>
                    <span className="month">Mar</span>
                  </div>
                  <div className="event-details">
                    <h4>Client Presentation</h4>
                    <p>2:00 PM - 3:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 