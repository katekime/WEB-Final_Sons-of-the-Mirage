const Notification = require("./notification.model");

async function createNotification({ recipient, sender, type, post }) {
  if (String(recipient) === String(sender)) return null;
  return Notification.create({ recipient, sender, type, post: post || null });
}

async function getNotifications(userId, { skip = 0, limit = 20 } = {}) {
  const [items, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username avatarUrl")
      .populate("post", "text"),
    Notification.countDocuments({ recipient: userId }),
  ]);
  return { items, total };
}

async function markAllRead(userId) {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true });
}

async function countUnread(userId) {
  return Notification.countDocuments({ recipient: userId, read: false });
}

module.exports = { createNotification, getNotifications, markAllRead, countUnread };
