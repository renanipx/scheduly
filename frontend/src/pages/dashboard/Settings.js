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

  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

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

  // Change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setLoadingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        process.env.REACT_APP_BACKEND_URL + '/api/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Error changing password.');
    } finally {
      setLoadingPassword(false);
    }
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
            {!user?.provider && (
              <button className="change-password-btn" onClick={() => setShowChangePassword(v => !v)}>
                Change Password
              </button>
            )}
            {user?.provider === 'google' && (
              <div style={{ color: '#888', fontSize: 14 }}>
                Password change is not available for Google accounts.
              </div>
            )}
          </div>
        </div>
      </div>

      {showChangePassword && (
        <div className="ai-assistant-modal">
          <div className="ai-assistant-content" style={{ maxWidth: 400, width: '95%', padding: 0, height: 'auto', maxHeight: '90vh', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 20, borderRadius: '20px 20px 0 0' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Change Password</h3>
              <button className="ai-close-btn" onClick={() => setShowChangePassword(false)}>&times;</button>
            </div>
            <form className="change-password-form" onSubmit={handleChangePassword} style={{ margin: 0, padding: 24 }}>
              <div className="form-group">
                <label htmlFor="current-password">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
              <button type="submit" className="save-password-btn" disabled={loadingPassword}>
                {loadingPassword ? 'Saving...' : 'Save Password'}
              </button>
            </form>
          </div>
        </div>
      )}

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