const service = require("./notification.service");
const { parsePagination } = require("../../utils/pagination");

async function list(req, res) {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const { items, total } = await service.getNotifications(req.user._id, { skip, limit });
    res.json({ page, limit, total, items });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function markRead(req, res) {
  try {
    await service.markAllRead(req.user._id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function unreadCount(req, res) {
  try {
    const count = await service.countUnread(req.user._id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { list, markRead, unreadCount };
