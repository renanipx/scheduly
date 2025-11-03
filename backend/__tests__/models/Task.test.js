const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Task = require('../../models/Task');
const User = require('../../models/User');

let mongoServer;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  testUser = new User({
    name: 'Test User',
    email: 'tasktest@example.com',
    password: 'password123'
  });
  await testUser.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Task Model Test', () => {
  it('should create & save task successfully', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      date: new Date(),
      status: 'pending',
      startTime: '09:00',
      endTime: '10:00',
      user: testUser._id
    };
    
    const validTask = new Task(taskData);
    const savedTask = await validTask.save();
    
    expect(savedTask._id).toBeDefined();
    expect(savedTask.title).toBe(taskData.title);
    expect(savedTask.status).toBe(taskData.status);
    expect(savedTask.user.toString()).toBe(testUser._id.toString());
  });

  it('should fail when required fields are missing', async () => {
    const taskWithoutTitle = new Task({
      description: 'Missing title task',
      status: 'pending',
      user: testUser._id
    });
    
    let err;
    try {
      await taskWithoutTitle.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});