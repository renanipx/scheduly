require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function setupDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI);

    await mongoose.connect('mongodb://127.0.0.1:27017/chronoly', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoCreate: true
    });
    console.log('Connected to MongoDB successfully');

    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));

    const adminExists = await User.findOne({ email: 'admin@chronoly.com' });
    if (!adminExists) {
      console.log('Creating admin user...');
      await User.create({
        name: 'Admin',
        email: 'admin@chronoly.com',
        password: 'admin123',
        role: 'admin',
        theme: 'light'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

setupDatabase();
