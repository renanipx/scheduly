const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const passport = require('passport');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { createCalendarEvent } = require('../services/calendarService');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Authentication middleware
const authenticate = passport.authenticate('jwt', { session: false });

// List tasks for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { title, date, status, startDate, endDate, month, year } = req.query;
    const filter = { user: req.user._id };

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (date) {
      filter.date = date;
    }
    if (status) {
      filter.status = status;
    }
    // Support filtering by date range
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }
    // Support filtering by month and year
    if (month && year) {
      const monthInt = parseInt(month, 10) - 1; // JS months are 0-based
      const yearInt = parseInt(year, 10);
      const firstDay = new Date(yearInt, monthInt, 1);
      const lastDay = new Date(yearInt, monthInt + 1, 0, 23, 59, 59, 999);
      filter.date = { $gte: firstDay, $lte: lastDay };
    }

    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Create new task
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, date, status, observation, startTime, endTime } = req.body;
    const task = new Task({
      title,
      description,
      date,
      status,
      observation,
      startTime,
      endTime,
      user: req.user._id
    });
    await task.save();
    
    let whatsappNotification = false;
    let calendarNotification = false;
    let calendarAuthRequired = false;
    let calendarAuthUrl = null;
    
    // Send WhatsApp notification if configured
    if (req.user.whatsappNumber) {
      const msg =
        `*New Task Created!*\n` +
        `Title: ${title}\n` +
        `Date: ${date ? new Date(date).toLocaleDateString('en-US') : '-'}\n` +
        `Time: ${startTime || '-'} to ${endTime || '-'}\n` +
        `Status: ${status}\n` +
        `Description: ${description || '-'}\n` +
        `Observation: ${observation || '-'}`;
      try {
        await sendWhatsAppMessage(req.user.whatsappNumber, msg);
        whatsappNotification = true;
      } catch (werr) {
        console.error('WhatsApp notification error:', werr);
        whatsappNotification = false;
      }
    }
    
    // Create calendar event if we have date and time
    if (date && startTime && endTime) {
      try {
        // Buscar usuário com todos os campos necessários
        const user = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken +typeCalendar +email +googleId');
        
        const calendarResult = await createCalendarEvent(user, {
          title,
          description,
          date,
          startTime,
          endTime
        });
        
        calendarNotification = calendarResult.success;
        
        // Check if authorization is required
        if (!calendarResult.success && calendarResult.requiresAuth) {
          calendarAuthRequired = true;
          calendarAuthUrl = calendarResult.authUrl;
        }
      } catch (cerr) {
        console.error('Calendar event creation error:', cerr);
        calendarNotification = false;
      }
    }
    
    res.status(201).json({
      ...task.toObject(),
      whatsappNotification,
      calendarNotification,
      calendarAuthRequired,
      calendarAuthUrl
    });
  } catch (err) {
    console.error('Task creation error:', err);
    res.status(400).json({ error: 'Error creating task' });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Error updating task' });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Error deleting task' });
  }
});

// Report export and email endpoint
router.get('/report', authenticate, async (req, res) => {
  try {
    const { month, year, startDate, endDate, format = 'xlsx' } = req.query;
    // Only allow up to 1 month range
    let filter = { user: req.user._id };
    let periodLabel = '';
    if (month && year) {
      const monthInt = parseInt(month, 10) - 1;
      const yearInt = parseInt(year, 10);
      const firstDay = new Date(yearInt, monthInt, 1);
      const lastDay = new Date(yearInt, monthInt + 1, 0, 23, 59, 59, 999);
      filter.date = { $gte: firstDay, $lte: lastDay };
      periodLabel = `${firstDay.toLocaleString('en-US', { month: 'long' })} ${yearInt}`;
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Check range is not more than 31 days
      if ((end - start) / (1000 * 60 * 60 * 24) > 31) {
        return res.status(400).json({ error: 'Range cannot exceed 31 days' });
      }
      filter.date = { $gte: start, $lte: end };
      periodLabel = `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
    } else {
      return res.status(400).json({ error: 'Please provide a valid month/year or startDate/endDate' });
    }
    const tasks = await Task.find(filter);
    if (!tasks.length) {
      return res.status(404).json({ error: 'No tasks found for the selected period' });
    }
    // Prepare file
    let buffer, filename, mimeType;
    if (format === 'pdf') {
      // PDF generation
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      let bufs = [];
      doc.on('data', d => bufs.push(d));
      doc.on('end', async () => {
        buffer = Buffer.concat(bufs);
        await sendReportEmail(req.user.email, buffer, filename, mimeType, periodLabel);
        res.json({ message: 'Report sent to your email!' });
      });
      filename = `Task-Report-${periodLabel.replace(/\s/g, '-')}.pdf`;
      mimeType = 'application/pdf';
      doc.fontSize(18).text('Task Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${periodLabel}`);
      doc.moveDown();
      // Table header
      doc.font('Helvetica-Bold').text('Title', 50, doc.y, { continued: true, width: 120 });
      doc.text('Status', 180, doc.y, { continued: true, width: 70 });
      doc.text('Date', 250, doc.y, { continued: true, width: 80 });
      doc.text('Start', 330, doc.y, { continued: true, width: 60 });
      doc.text('End', 390, doc.y, { width: 60 });
      doc.font('Helvetica');
      doc.moveDown(0.5);
      tasks.forEach(task => {
        doc.text(task.title, 50, doc.y, { continued: true, width: 120 });
        doc.text(task.status, 180, doc.y, { continued: true, width: 70 });
        doc.text((task.date || '').toISOString().slice(0, 10), 250, doc.y, { continued: true, width: 80 });
        doc.text(task.startTime || '', 330, doc.y, { continued: true, width: 60 });
        doc.text(task.endTime || '', 390, doc.y, { width: 60 });
      });
      doc.end();
      return;
    } else {
      // XLSX generation
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Tasks');
      sheet.columns = [
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Start', key: 'startTime', width: 10 },
        { header: 'End', key: 'endTime', width: 10 }
      ];
      tasks.forEach(task => {
        sheet.addRow({
          title: task.title,
          status: task.status,
          date: (task.date || '').toISOString().slice(0, 10),
          startTime: task.startTime || '',
          endTime: task.endTime || ''
        });
      });
      buffer = await workbook.xlsx.writeBuffer();
      filename = `Task-Report-${periodLabel.replace(/\s/g, '-')}.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      await sendReportEmail(req.user.email, buffer, filename, mimeType, periodLabel);
      return res.json({ message: 'Report sent to your email!' });
    }
  } catch (err) {
    console.error('Report export error:', err);
    res.status(500).json({ error: 'Failed to generate or send report' });
  }
});

// Helper to send report email
async function sendReportEmail(email, buffer, filename, mimeType, periodLabel) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) throw new Error('Email not configured');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  const mailOptions = {
    from: `"Chronoly" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Task Report - ${periodLabel}`,
    html: `<p>Your requested task report for <b>${periodLabel}</b> is attached.</p>`,
    attachments: [
      {
        filename,
        content: buffer,
        contentType: mimeType
      }
    ]
  };
  await transporter.sendMail(mailOptions);
}

module.exports = router; 