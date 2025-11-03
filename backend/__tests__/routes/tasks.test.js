const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Task = require('../../models/Task');
const taskRoutes = require('../../routes/tasks');

let mongoServer;
let app;
let testUser;
let token;

jest.mock('../../services/whatsappService', () => ({
  sendWhatsAppMessage: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../services/calendarService', () => ({
  createCalendarEvent: jest.fn().mockResolvedValue({ id: 'mock-calendar-id' })
}));

jest.mock('passport', () => {
  return {
    authenticate: jest.fn(() => (req, res, next) => {
      next();
    })
  };
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  testUser = new User({
    name: 'Route Test User',
    email: 'routetest@example.com',
    password: 'password123'
  });
  await testUser.save();
  
  app = express();
  app.use(express.json());
  
  app.use((req, res, next) => {
    req.user = testUser;
    next();
  });
  
  app.use('/api/tasks', taskRoutes);
  
  token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Task Routes Tests', () => {
  it('should create a new task', async () => {
    const taskData = {
      title: 'Test Task from Route',
      description: 'This is a test task created via API',
      date: new Date().toISOString(),
      status: 'pending',
      startTime: '09:00',
      endTime: '10:00'
    };
    
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(taskData);
    
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(taskData.title);
    expect(response.body.user).toBe(testUser._id.toString());
  });
  
  it('should get all tasks for the authenticated user', async () => {
    await Task.create({
      title: 'Task 1',
      description: 'Description 1',
      date: new Date(),
      status: 'pending',
      user: testUser._id
    });
    
    await Task.create({
      title: 'Task 2',
      description: 'Description 2',
      date: new Date(),
      status: 'completed',
      user: testUser._id
    });
    
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });
});