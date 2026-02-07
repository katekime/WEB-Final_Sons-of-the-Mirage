const nodemailer = require("nodemailer");
const { env } = require("../config/env");

function makeTransport() {
  if (!env.SENDGRID_API_KEY) return null;

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

  await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Welcome to Connectify",
    text: `Hi ${username}! Welcome to Connectify.`,
    html: `<p>Hi <b>${username}</b>! Welcome to Connectify.</p>`
  });
}

module.exports = { sendWelcomeEmail };
