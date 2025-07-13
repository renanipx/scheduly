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

// Handle Google OAuth callback for Calendar with task creation
router.get('/calendar/callback', authenticate, async (req, res) => {
  try {
    const { code, state } = req.query;
    
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

    // Check if this was a task creation callback
    if (state) {
      try {
        const stateData = JSON.parse(state);
        if (stateData.returnTo === 'task-creation' && stateData.taskData) {
          // Create the calendar event now that we have tokens
          const { createCalendarEvent } = require('../services/calendarService');
          const calendarResult = await createCalendarEvent(user, stateData.taskData);
          
          if (calendarResult.success) {
            // Redirect to frontend with success and event info
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/#/dashboard?calendar_auth=success&event_created=true`);
            return;
          } else {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/#/dashboard?calendar_auth=success&event_created=false&error=${encodeURIComponent(calendarResult.error)}`);
            return;
          }
        }
      } catch (stateError) {
        console.error('Error parsing state data:', stateError);
      }
    }

    // Default redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/#/settings?google_auth=success`);
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/#/settings?google_auth=error`);
  }
});

// Check Google Calendar connection status
router.get('/calendar/status', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken +typeCalendar +email');
    
    const status = {
      connected: false,
      typeCalendar: user.typeCalendar,
      hasAccessToken: !!user.googleAccessToken,
      hasRefreshToken: !!user.googleRefreshToken,
      email: user.email,
      message: ''
    };

    if (user.typeCalendar === 'google') {
      if (user.googleAccessToken && user.googleRefreshToken) {
        status.connected = true;
        status.message = 'Google Calendar is connected and ready to use';
      } else {
        status.message = 'Google Calendar is configured but tokens are missing. Please reconnect.';
      }
    } else {
      status.message = 'Google Calendar is not configured';
    }

    res.json(status);
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    res.status(500).json({ error: 'Error checking Google Calendar status' });
  }
});

// Refresh Google Calendar tokens
router.post('/calendar/refresh', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken +typeCalendar');
    
    if (!user.googleRefreshToken) {
      return res.status(400).json({ error: 'No refresh token available. Please reconnect Google Calendar.' });
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      refresh_token: user.googleRefreshToken
    });

    const { credentials } = await auth.refreshAccessToken();
    
    // Update user with new access token
    user.googleAccessToken = credentials.access_token;
    if (credentials.refresh_token) {
      user.googleRefreshToken = credentials.refresh_token;
    }
    await user.save();

    res.json({ 
      message: 'Google Calendar tokens refreshed successfully',
      hasNewAccessToken: !!credentials.access_token
    });
  } catch (error) {
    console.error('Error refreshing Google Calendar tokens:', error);
    res.status(500).json({ error: 'Error refreshing tokens. Please reconnect Google Calendar.' });
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