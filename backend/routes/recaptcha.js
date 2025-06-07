const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token
      }
    });


    res.json({
      success: response.data.success,
      score: response.data.score
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify reCAPTCHA' });
  }
});

module.exports = router; 