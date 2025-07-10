const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Authentication middleware
const authenticate = passport.authenticate('jwt', { session: false });

// Google OAuth2 setup for Calendar
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate Google OAuth URL for Calendar access
router.get('/calendar/auth-url', authenticate, (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force consent to get refresh token
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Error generating authentication URL' });
  }
});

// Handle Google OAuth callback for Calendar
router.get('/calendar/callback', authenticate, async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Update user with Google tokens
    const user = await User.findById(req.user._id);
    user.googleAccessToken = tokens.access_token;
    user.googleRefreshToken = tokens.refresh_token;
    user.typeCalendar = 'google';
    await user.save();

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/#/settings?google_auth=success`);
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/#/settings?google_auth=error`);
  }
});

// Disconnect Google Calendar
router.post('/calendar/disconnect', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.googleAccessToken = null;
    user.googleRefreshToken = null;
    user.typeCalendar = null;
    await user.save();

    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: 'Error disconnecting Google Calendar' });
  }
});

module.exports = router; 