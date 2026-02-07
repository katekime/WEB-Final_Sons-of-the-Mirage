const service = require("./like.service");

async function like(req, res) {
  try {
    const result = await service.likePost(req.user._id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Like failed" });
  }
}
async function unlike(req, res) {
  try {
    const result = await service.unlikePost(req.user._id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Unlike failed" });
  }
}

module.exports = { like, unlike };
