const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; 

const client = twilio(accountSid, authToken);

async function sendWhatsAppMessage(to, message) {
  if (!accountSid || !authToken || !whatsappFrom) {
    throw new Error('Twilio credentials not set');
  }
  const cleanTo = to.trim().replace(/\s+/g, '');
  try {
    const result = await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${cleanTo}`,
      body: message
    });
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = { sendWhatsAppMessage }; 