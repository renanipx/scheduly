const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/CalendarEvent');
const passport = require('passport');

// Authentication middleware
const authenticate = passport.authenticate('jwt', { session: false });

// List events for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const events = await CalendarEvent.find({ user: req.user._id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Create new event
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, start, end } = req.body;
    const event = new CalendarEvent({
      title,
      description,
      start,
      end,
      user: req.user._id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: 'Error creating event' });
  }
});

// Update event
router.put('/:id', authenticate, async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: 'Error updating event' });
  }
});

// Delete event
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Error deleting event' });
  }
});

module.exports = router; 