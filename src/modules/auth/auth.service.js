const User = require("../users/user.model");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { signToken } = require("../../utils/jwt");
const { sendWelcomeEmail } = require("../../utils/email");

async function register({ username, email, password }) {
  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) {
    const field = exists.email === email ? "email" : "username";
    const err = new Error(`${field} already exists`);
    err.status = 400;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ username, email, passwordHash, role: "user" });

  await sendWelcomeEmail(user.email, user.username);

  const token = signToken({ id: user._id });
  return { token, user: safeUser(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: user._id });
  return { token, user: safeUser(user) };
}

function safeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt
  };
}

module.exports = { register, login };
