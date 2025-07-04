import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AIAssistant from '../../components/AIAssistant';
import '../../assets/Dashboard.css';

const menuItems = [
  { name: 'Dashboard', icon: 'fas fa-home', path: '/dashboard' },
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

  // AI Assistant callbacks
  const handleTaskCreated = (taskData) => {
    // This will be handled by the Tasks component
    // We can emit a custom event or use a global state management solution
    window.dispatchEvent(new CustomEvent('ai-task-created', { detail: taskData }));
  };

  const handleEventCreated = (eventData) => {
    // This will be handled by the Calendar component
    window.dispatchEvent(new CustomEvent('ai-event-created', { detail: eventData }));
  };

  const handleSettingsChanged = (settingsData) => {
    // This will be handled by the Settings component
    window.dispatchEvent(new CustomEvent('ai-settings-changed', { detail: settingsData }));
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
      <main className="main-content">
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      {/* Global AI Assistant */}
      <AIAssistant 
        onTaskCreated={handleTaskCreated}
        onEventCreated={handleEventCreated}
        onSettingsChanged={handleSettingsChanged}
      />
    </div>
  );
};

export default DashboardLayout; 