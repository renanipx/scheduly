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
    language: 'en',
    whatsapp: false,
    whatsappNumber: '',
    calendar: false,
    calendarProvider: 'google',
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
          {settings.notifications && (
            <div className="notification-options-box">
              <div className="notification-options-title">Notification Methods</div>
              <label className="notification-option-label">
                {/* WhatsApp Icon */}
                <svg viewBox="0 0 32 32" fill="currentColor" style={{marginRight: 4}} width="20" height="20"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.08 2.36 7.09L4 29l7.18-2.31C13.08 27.14 14.51 27.5 16 27.5c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.34 0-2.64-.26-3.85-.76l-.27-.11-4.28 1.38 1.4-4.16-.18-.28C7.26 18.01 7 16.52 7 15c0-5.06 4.13-9.18 9.18-9.18S25.36 9.94 25.36 15c0 5.06-4.13 9.18-9.18 9.18zm5.13-6.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.56-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.99 2.44.01 1.44 1.03 2.84 1.18 3.04.15.2 2.03 3.1 5.01 4.22.7.24 1.25.38 1.68.48.7.15 1.34.13 1.85.08.56-.06 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg>
                <input
                  type="checkbox"
                  checked={settings.whatsapp}
                  onChange={e => handleSettingChange('whatsapp', e.target.checked)}
                />
                Send WhatsApp message
              </label>
              {settings.whatsapp && (
                <div style={{ marginLeft: 32, marginBottom: 12 }}>
                  <label htmlFor="whatsapp-number" style={{ fontWeight: 500, color: '#444', marginRight: 8 }}>WhatsApp Number</label>
                  <input
                    id="whatsapp-number"
                    type="tel"
                    placeholder="e.g. +55 11 91234-5678"
                    value={settings.whatsappNumber}
                    onChange={e => handleSettingChange('whatsappNumber', e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1.5px solid #ccc', minWidth: 180 }}
                  />
                </div>
              )}
              <label className="notification-option-label">
                {/* Calendar Icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" style={{marginRight: 4}} width="20" height="20"><path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 18H5V8h14v12zm0-14H5V6h14v2z"/></svg>
                <input
                  type="checkbox"
                  checked={settings.calendar}
                  onChange={e => handleSettingChange('calendar', e.target.checked)}
                />
                Create a calendar event in the provided email
              </label>
              {settings.calendar && (
                <div style={{ marginTop: 8 }}>
                  <label style={{ marginRight: 8 }}>Calendar Provider</label>
                  <select
                    value={settings.calendarProvider}
                    onChange={e => handleSettingChange('calendarProvider', e.target.value)}
                  >
                    <option value="google">Google Calendar</option>
                    <option value="outlook">Outlook Calendar</option>
                  </select>
                </div>
              )}
            </div>
          )}
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