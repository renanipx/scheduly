const axios = require('axios');

const verifyRecaptchaV3 = async (token) => {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
    );
    
    if (!response.data.success) {
      return false;
    }

    const score = response.data.score;
    return score >= 0.3;
  } catch (error) {
    console.error('reCAPTCHA v3 verification error:', error);
    return false;
  }
};

// Middleware that only validates V3
const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA token is required' });
  }

  // Only validate V3
  const v3Success = await verifyRecaptchaV3(recaptchaToken);
  
  if (v3Success) {
    return next();
  }

  return res.status(400).json({ message: 'reCAPTCHA verification failed' });
};

module.exports = {
  verifyRecaptcha
}; 