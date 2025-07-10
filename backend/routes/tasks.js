const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const passport = require('passport');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { createCalendarEvent } = require('../services/calendarService');

// Authentication middleware
const authenticate = passport.authenticate('jwt', { session: false });

// List tasks for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { title, date, status } = req.query;
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
        whatsappNotification = false;
      }
    }
    
    // Create calendar event if configured
    if (req.user.typeCalendar && date && startTime && endTime) {
      try {
        const user = await User.findById(req.user._id);
        const calendarResult = await createCalendarEvent(user, {
          title,
          description,
          date,
          startTime,
          endTime
        });
        calendarNotification = calendarResult.success;
      } catch (cerr) {
        console.error('Calendar event creation error:', cerr);
        calendarNotification = false;
      }
    }
    
    res.status(201).json({
      ...task.toObject(),
      whatsappNotification,
      calendarNotification
    });
  } catch (err) {
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

module.exports = router; 