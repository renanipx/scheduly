const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Google Calendar API setup
const getGoogleAuth = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return oauth2Client;
};

// Try to automatically connect Google Calendar using existing Google ID
const tryAutoConnectGoogleCalendar = async (user) => {
  try {

    if (!user.googleId) {
      throw new Error('User does not have Google ID - cannot auto-connect');
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Try to get tokens using Google ID (this is a simplified approach)
    // In a real implementation, you might need to use a different approach
    // such as using service account or stored refresh tokens
    
    // For now, we'll return false to indicate auto-connect is not possible
    // and the user needs to manually connect
    return {
      success: false,
      error: 'Auto-connect requires manual Google Calendar authorization',
      requiresManualAuth: true
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      requiresManualAuth: true
    };
  }
};

// Create Google Calendar event with auto-connect attempt
const createGoogleCalendarEvent = async (user, taskData) => {
  try {
    // Verificações mais detalhadas
    if (!user) {
      throw new Error('User object is required');
    }
    
    // If user doesn't have tokens, try to auto-connect
    if (!user.googleAccessToken || !user.googleRefreshToken) {
      
      const autoConnectResult = await tryAutoConnectGoogleCalendar(user);
      
      if (!autoConnectResult.success) {
        // If auto-connect fails, try to create a one-time auth URL
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );

        const scopes = [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ];

        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes,
          prompt: 'consent',
          state: JSON.stringify({
            userId: user._id.toString(),
            taskData: taskData,
            returnTo: 'task-creation'
          })
        });

        return {
          success: false,
          error: 'Google Calendar authorization required',
          provider: 'google',
          requiresAuth: true,
          authUrl: authUrl,
          message: 'Please authorize Google Calendar access to create events automatically'
        };
      }
      
      // If auto-connect succeeded, update user tokens
      user.googleAccessToken = autoConnectResult.accessToken;
      user.googleRefreshToken = autoConnectResult.refreshToken;
      user.typeCalendar = 'google';
      await user.save();
    }

    const auth = getGoogleAuth();
    auth.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Parse task date and time
    const taskDate = new Date(taskData.date);
    const [startHour, startMinute] = taskData.startTime.split(':').map(Number);
    const [endHour, endMinute] = taskData.endTime.split(':').map(Number);

    const startDateTime = new Date(taskDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(taskDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const event = {
      summary: taskData.title,
      description: taskData.description || '',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return {
      success: true,
      eventId: response.data.id,
      provider: 'google'
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', {
      error: error.message,
      userId: user?._id,
      taskTitle: taskData?.title
    });
    return {
      success: false,
      error: error.message,
      provider: 'google'
    };
  }
};

// Create Outlook Calendar event via email
const createOutlookCalendarEvent = async (user, taskData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured');
    }

    if (!user.email) {
      throw new Error('User email is required for Outlook calendar integration');
    }

    const isOutlookEmail = user.email.toLowerCase().includes('outlook.com') || 
                          user.email.toLowerCase().includes('hotmail.com') ||
                          user.email.toLowerCase().includes('live.com');

    // Parse task date and time
    const taskDate = new Date(taskData.date);
    const [startHour, startMinute] = taskData.startTime.split(':').map(Number);
    const [endHour, endMinute] = taskData.endTime.split(':').map(Number);

    const startDateTime = new Date(taskDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(taskDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // Create iCalendar format
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Chronoly//Task Calendar Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@chronoly.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${taskData.title}`,
      `DESCRIPTION:${taskData.description || ''}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const emailInstructions = isOutlookEmail 
      ? `<p><strong>To add to your Outlook calendar:</strong></p>
         <ol>
           <li>Download the "calendar-event.ics" attachment</li>
           <li>Double-click the downloaded file</li>
           <li>Outlook will open and ask if you want to add the event</li>
           <li>Click "Yes" to add it to your calendar</li>
         </ol>
         <p><em>Note: If Outlook doesn't open automatically, right-click the file and select "Open with" → "Outlook"</em></p>`
      : `<p><strong>To add to your calendar:</strong></p>
         <ol>
           <li>Download the "calendar-event.ics" attachment</li>
           <li>Open your calendar application (Google Calendar, Apple Calendar, etc.)</li>
           <li>Look for "Import" or "Add event from file" option</li>
           <li>Select the downloaded .ics file</li>
           <li>The event will be added to your calendar</li>
         </ol>`;

    const mailOptions = {
      from: `"Chronoly" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `📅 New Calendar Event: ${taskData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #764ba2;">📅 New Event Created</h2>
          <p>A new calendar event has been created for your task:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #764ba2;">
            <h3 style="margin-top: 0; color: #333;">${taskData.title}</h3>
            <p><strong>📅 Date:</strong> ${taskDate.toLocaleDateString('en-US')}</p>
            <p><strong>⏰ Time:</strong> ${taskData.startTime} - ${taskData.endTime}</p>
            ${taskData.description ? `<p><strong>📝 Description:</strong> ${taskData.description}</p>` : ''}
          </div>
          ${emailInstructions}
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            <em>This email was sent automatically by the Chronoly system. 
            The attached file (.ics) is compatible with most calendar applications.</em>
          </p>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> The event is not automatically added to your calendar. 
            You need to manually import the attached .ics file following the instructions above.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `calendar-event-${taskData.title.replace(/[^a-zA-Z0-9]/g, '-')}.ics`,
          content: icsContent,
          contentType: 'text/calendar; method=REQUEST'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      provider: 'outlook',
      emailSent: true,
      userEmail: user.email,
      isOutlookEmail: isOutlookEmail
    };
  } catch (error) {
    console.error('Error creating Outlook Calendar event:', {
      error: error.message,
      userId: user?._id,
      userEmail: user?.email,
      taskTitle: taskData?.title
    });
    return {
      success: false,
      error: error.message,
      provider: 'outlook'
    };
  }
};

// Main function to create calendar event based on user's calendar provider
const createCalendarEvent = async (user, taskData) => {
  try {
    // Verificações mais robustas
    if (!user) {
      return {
        success: false,
        error: 'User object is required',
        provider: null
      };
    }

    if (!taskData.title || !taskData.date || !taskData.startTime || !taskData.endTime) {
      return {
        success: false,
        error: 'Missing required task data (title, date, startTime, endTime)',
        provider: null
      };
    }

    // If no calendar provider is set, try Google Calendar first (since user has Google ID)
    if (!user.typeCalendar && user.googleId) {
      return await createGoogleCalendarEvent(user, taskData);
    }

    // If calendar provider is set, use it
    if (user.typeCalendar) {
      switch (user.typeCalendar) {
        case 'google':
          return await createGoogleCalendarEvent(user, taskData);
        case 'outlook':
          return await createOutlookCalendarEvent(user, taskData);
        default:
          return {
            success: false,
            error: 'Unsupported calendar provider',
            provider: user.typeCalendar
          };
      }
    }

    // If no Google ID and no calendar provider, try Outlook
    return await createOutlookCalendarEvent(user, taskData);

  } catch (error) {
    console.error('Error creating calendar event:', {
      error: error.message,
      userId: user?._id,
      provider: user?.typeCalendar
    });
    return {
      success: false,
      error: error.message,
      provider: user?.typeCalendar
    };
  }
};

module.exports = {
  createCalendarEvent,
  createGoogleCalendarEvent,
  createOutlookCalendarEvent,
  tryAutoConnectGoogleCalendar
}; 