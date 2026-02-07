const Follow = require("./follow.model");
const { createNotification } = require("../notifications/notification.service");

async function follow(req, res) {
  try {
    await Follow.create({ follower: req.user._id, following: req.params.userId });
    try {
      await createNotification({
        recipient: req.params.userId,
        sender: req.user._id,
        type: "follow",
      });
    } catch (_) {}
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: true, already: true });
  }
}

async function unfollow(req, res) {
  await Follow.findOneAndDelete({ follower: req.user._id, following: req.params.userId });
  res.json({ ok: true });
}

module.exports = { follow, unfollow };
