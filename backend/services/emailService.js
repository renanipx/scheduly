const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendPasswordResetEmail = async (email, resetToken) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials not configured. Please check EMAIL_USER and EMAIL_PASSWORD environment variables.');
  }

  const baseUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
  const resetUrl = `${baseUrl}/#/reset-password/${resetToken}`;
  
  console.log('Reset URL:', resetUrl);

  const mailOptions = {
    from: `"Chronoly" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #764ba2;">Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #764ba2; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;"
             onclick="window.location.href='${resetUrl}'; return false;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, please ignore this email or contact support if you have concerns.
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
}; 