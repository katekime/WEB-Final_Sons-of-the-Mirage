const dotenv = require("dotenv");
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  EMAIL_FROM: process.env.EMAIL_FROM,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
};

if (!env.MONGO_URI || !env.JWT_SECRET) {
  throw new Error("Missing required env vars: MONGO_URI or JWT_SECRET");
}

module.exports = { env };
