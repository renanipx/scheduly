const axios = require('axios');

// Middleware for reCAPTCHA v2 verification
const verifyRecaptchaV2 = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA token is required' });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!response.data.success) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ message: 'Error verifying reCAPTCHA' });
  }
};

// Middleware for reCAPTCHA v3 verification
const verifyRecaptchaV3 = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA token is required' });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!response.data.success) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    // For v3, we also check the score (0.0 to 1.0)
    // You can adjust the threshold as needed
    const score = response.data.score;
    if (score < 0.5) {
      return res.status(400).json({ message: 'reCAPTCHA score too low' });
    }

    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ message: 'Error verifying reCAPTCHA' });
  }
};

module.exports = {
  verifyRecaptchaV2,
  verifyRecaptchaV3
}; 