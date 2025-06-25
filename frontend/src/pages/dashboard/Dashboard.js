import React from 'react';
import Calendar from './Calendar';
import '../../assets/Dashboard.css';

const Dashboard = () => {
  return (
    <>
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
          <Calendar />
        </div>
      </div>
    </>
  );
};

export default Dashboard; 