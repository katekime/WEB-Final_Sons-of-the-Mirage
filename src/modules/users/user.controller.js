const service = require("./user.service");
const User = require("./user.model");

async function getByUsername(req, res) {
  try {
    const user = await service.getPublicProfile(req.params.username);
    res.json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await service.updateMyProfile(req.user._id, req.body);
    res.json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function uploadAvatar(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { avatarUrl });
    res.json({ avatarUrl });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
}

async function search(req, res) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ message: "Query q is required" });
    const users = await service.searchUsers(q);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getByUsername, updateProfile, uploadAvatar, search };
