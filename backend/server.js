const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const { verifyRecaptchaV2, verifyRecaptchaV3 } = require('./middleware/recaptcha');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoCreate: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

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