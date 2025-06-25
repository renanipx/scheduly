import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/Dashboard.css';

const menuItems = [
  { name: 'Dashboard', icon: 'fas fa-home', path: '/dashboard' },
  { name: 'Calendar', icon: 'fas fa-calendar', path: '/calendar' },
  { name: 'Tasks', icon: 'fas fa-tasks', path: '/tasks' },
  { name: 'Settings', icon: 'fas fa-cog', path: '/settings' },
];

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  React.useEffect(() => {
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
      {/* Sidebar Backdrop for mobile */}
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src={require('../../assets/images/logo.svg').default} alt="Chronoly" className="sidebar-logo" />
          <button 
            className="toggle-sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.name} className={location.pathname.startsWith(item.path) ? 'active' : ''}>
                <button
                  className="sidebar-link-btn"
                  onClick={() => navigate(item.path)}
                  style={{ background: 'none', border: 'none', padding: 0, margin: 0, width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                  <i className={item.icon}></i>
                  {isSidebarOpen && <span>{item.name}</span>}
                </button>
              </li>
            ))}
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
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 