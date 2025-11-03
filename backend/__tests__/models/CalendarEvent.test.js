const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CalendarEvent = require('../../models/CalendarEvent');
const User = require('../../models/User');

let mongoServer;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  testUser = new User({
    name: 'Calendar Test User',
    email: 'calendartest@example.com',
    password: 'password123'
  });
  await testUser.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('CalendarEvent Model Test', () => {
  it('should create & save calendar event successfully', async () => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    const eventData = {
      title: 'Test Event',
      description: 'This is a test event',
      start: startDate,
      end: endDate,
      user: testUser._id
    };
    
    const validEvent = new CalendarEvent(eventData);
    const savedEvent = await validEvent.save();
    
    expect(savedEvent._id).toBeDefined();
    expect(savedEvent.title).toBe(eventData.title);
    expect(savedEvent.user.toString()).toBe(testUser._id.toString());
  });

  it('should fail when required fields are missing', async () => {
    const eventWithoutTitle = new CalendarEvent({
      description: 'Missing title event',
      start: new Date(),
      end: new Date(),
      user: testUser._id
    });
    
    let err;
    try {
      await eventWithoutTitle.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});