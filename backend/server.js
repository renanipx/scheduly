const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { verifyRecaptchaV2, verifyRecaptchaV3 } = require('./middleware/recaptcha');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Login route with reCAPTCHA v2
app.post('/api/login', verifyRecaptchaV2, async (req, res) => {
  const { email, password } = req.body;

  // Here you would typically:
  // 1. Validate user credentials
  // 2. Generate JWT token
  // 3. Return user data and token

  // For demo purposes, we'll just return a success message
  res.json({ message: 'Login successful' });
});

// Example route with reCAPTCHA v3
app.post('/api/sensitive-action', verifyRecaptchaV3, async (req, res) => {
  // This is an example of a sensitive action that uses reCAPTCHA v3
  // The middleware will verify the score before allowing the action
  res.json({ message: 'Sensitive action completed successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 