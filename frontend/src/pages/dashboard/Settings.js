import React, { useState, useEffect } from 'react';
import '../../assets/Dashboard.css';
import '../../assets/Settings.css';
import { useUser } from '../../context/UserContext';
import axios from 'axios';

const Settings = () => {
  const { user, setUser } = useUser();
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    email: '',
    language: 'en'
  });
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);

  // Listen for AI assistant events
  useEffect(() => {
    const handleAISettingsChanged = (event) => {
      const settingsData = event.detail;
      setCurrentSetting(settingsData);
      setShowSettingsForm(true);
    };

    window.addEventListener('ai-settings-changed', handleAISettingsChanged);

    return () => {
      window.removeEventListener('ai-settings-changed', handleAISettingsChanged);
    };
  }, []);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.theme]);

  useEffect(() => {
    if (user && user.theme) {
      setSettings(prev => ({
        ...prev,
        theme: user.theme
      }));
    }
  }, [user]);

  const updateTheme = async (theme) => {
    try {
      if (!user) return;
      const token = localStorage.getItem('token');
      await axios.put(
        process.env.REACT_APP_BACKEND_URL + '/api/users/theme',
        { theme },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, theme });
    } catch (error) { }
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    if (setting === 'theme') {
      updateTheme(value);
    }
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', settings);
    setShowSettingsForm(false);
    setCurrentSetting(null);
  };

  return (
    <div className="settings-component">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <label>Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label>Enable Notifications</label>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Security</h2>
          <div className="setting-item">
            <button className="change-password-btn">Change Password</button>
          </div>
        </div>
      </div>

      {/* Settings Form Modal */}
      {showSettingsForm && currentSetting && (
        <div className="settings-modal">
          <div className="settings-modal-content">
            <h3>AI Assistant Suggestion</h3>
            <p>{currentSetting.suggestion}</p>
            <div className="settings-modal-actions">
              <button onClick={() => setShowSettingsForm(false)}>Close</button>
              <button onClick={handleSaveSettings}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 