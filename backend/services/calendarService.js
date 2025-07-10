const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// Google Calendar API setup
const getGoogleAuth = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return oauth2Client;
};

// Create Google Calendar event
const createGoogleCalendarEvent = async (user, taskData) => {
  try {
    if (!user.googleAccessToken) {
      throw new Error('Google access token not available');
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
    console.error('Error creating Google Calendar event:', error);
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

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: `"Chronoly" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Calendar Event: ${taskData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #764ba2;">New Calendar Event Created</h2>
          <p>A new calendar event has been created for your task:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">${taskData.title}</h3>
            <p><strong>Date:</strong> ${taskDate.toLocaleDateString('pt-BR')}</p>
            <p><strong>Time:</strong> ${taskData.startTime} - ${taskData.endTime}</p>
            ${taskData.description ? `<p><strong>Description:</strong> ${taskData.description}</p>` : ''}
          </div>
          <p style="color: #666; font-size: 14px;">
            This event has been added to your Outlook calendar. You can also import the attached .ics file to other calendar applications.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'calendar-event.ics',
          content: icsContent,
          contentType: 'text/calendar; method=REQUEST'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      provider: 'outlook'
    };
  } catch (error) {
    console.error('Error creating Outlook Calendar event:', error);
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
    if (!user.typeCalendar) {
      return {
        success: false,
        error: 'No calendar provider configured',
        provider: null
      };
    }

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
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error.message,
      provider: user.typeCalendar
    };
  }
};

module.exports = {
  createCalendarEvent,
  createGoogleCalendarEvent,
  createOutlookCalendarEvent
}; 