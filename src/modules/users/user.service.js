const User = require("./user.model");

async function getPublicProfile(username) {
  const user = await User.findOne({ username }).select("username bio avatarUrl role createdAt");
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
}

async function updateMyProfile(userId, data) {
  delete data.role;

  if (data.username) {
    const exists = await User.findOne({ username: data.username, _id: { $ne: userId } });
    if (exists) {
      const err = new Error("username already exists");
      err.status = 400;
      throw err;
    }
  }
  if (data.email) {
    const exists = await User.findOne({ email: data.email, _id: { $ne: userId } });
    if (exists) {
      const err = new Error("email already exists");
      err.status = 400;
      throw err;
    }
  }

  const updated = await User.findByIdAndUpdate(userId, data, { new: true }).select("-passwordHash");
  return updated;
}

async function searchUsers(q) {
  const regex = new RegExp(q, "i");
  return User.find({ username: regex }).select("username bio avatarUrl role").limit(20);
}

module.exports = { getPublicProfile, updateMyProfile, searchUsers };
