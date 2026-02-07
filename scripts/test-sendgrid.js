// Standalone SendGrid test — does NOT start the server
const nodemailer = require("nodemailer");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

console.log("SENDGRID_API_KEY present:", !!SENDGRID_API_KEY);
console.log("SENDGRID_API_KEY starts with:", SENDGRID_API_KEY?.slice(0, 10) + "...");
console.log("EMAIL_FROM:", EMAIL_FROM);

if (!SENDGRID_API_KEY) {
  console.error("No SENDGRID_API_KEY in .env!");
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: { user: "apikey", pass: SENDGRID_API_KEY },
});

console.log("\nVerifying SMTP connection...");
transport.verify()
  .then(() => {
    console.log("SMTP connection OK!");
    console.log("\nSending test email...");
    return transport.sendMail({
      from: EMAIL_FROM,
      to: "katekime07@gmail.com",  // sending to yourself for testing
      subject: "Connectify Test Email",
      text: "If you see this, SendGrid is working!",
      html: "<p>If you see this, <b>SendGrid is working!</b></p>",
    });
  })
  .then((info) => {
    console.log("Email sent! MessageId:", info.messageId);
    console.log("Response:", info.response);
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILED:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  });
