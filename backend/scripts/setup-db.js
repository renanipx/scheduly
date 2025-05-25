require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function setupDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoCreate: true
    });
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@chronoly.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@chronoly.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    console.log('Database setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 