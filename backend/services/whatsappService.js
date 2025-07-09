const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // Ex: 'whatsapp:+14155238886'

const client = twilio(accountSid, authToken);

async function sendWhatsAppMessage(to, message) {
  if (!accountSid || !authToken || !whatsappFrom) {
    throw new Error('Twilio credentials not set');
  }
  return client.messages.create({
    from: whatsappFrom,
    to: `whatsapp:${to}`,
    body: message
  });
}

module.exports = { sendWhatsAppMessage }; 