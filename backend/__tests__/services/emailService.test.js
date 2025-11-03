const { sendPasswordResetEmail } = require('../../services/emailService');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockImplementation((mailOptions) => {
      return Promise.resolve({
        messageId: 'mock-message-id',
        response: 'mock-response'
      });
    })
  })
}));

describe('Email Service Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      EMAIL_USER: 'test@example.com',
      EMAIL_PASSWORD: 'testpassword',
      FRONTEND_URL: 'http://localhost:3000'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should send password reset email successfully', async () => {
    const email = 'user@example.com';
    const resetToken = 'test-reset-token';
    
    await expect(sendPasswordResetEmail(email, resetToken)).resolves.not.toThrow();
  });

  it('should throw error when email credentials are not configured', async () => {
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    
    const email = 'user@example.com';
    const resetToken = 'test-reset-token';
    
    await expect(sendPasswordResetEmail(email, resetToken)).rejects.toThrow(
      'Email credentials not configured'
    );
  });
});