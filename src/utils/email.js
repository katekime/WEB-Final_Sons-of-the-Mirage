const nodemailer = require("nodemailer");
const { env } = require("../config/env");

function makeTransport() {
  if (!env.SENDGRID_API_KEY) {
    console.warn("[EMAIL] SENDGRID_API_KEY not set — skipping email");
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: env.SENDGRID_API_KEY
    }
  });
}

async function sendWelcomeEmail(to, username) {
  const transport = makeTransport();
  if (!transport) return;

  try {
    const info = await transport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: "Welcome to Connectify",
      text: `Hi ${username}! Welcome to Connectify.`,
      html: `<p>Hi <b>${username}</b>! Welcome to Connectify.</p>`
    });
    console.log("[EMAIL] Welcome email sent to", to, "messageId:", info.messageId);
  } catch (err) {
    console.error("[EMAIL] Failed to send welcome email to", to);
    console.error("[EMAIL]", err.message);
    // Don't throw — email failure should not block registration
  }
}

module.exports = { sendWelcomeEmail };
