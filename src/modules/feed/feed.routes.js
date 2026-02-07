const router = require("express").Router();
const { auth } = require("../../middleware/auth");
const Follow = require("../follows/follow.model");
const Post = require("../posts/post.model");
const Like = require("../likes/like.model");
const { parsePagination } = require("../../utils/pagination");

router.use(auth);

router.get("/", async (req, res) => {
  const { skip, limit, page } = parsePagination(req.query);

  const follows = await Follow.find({ follower: req.user._id }).select("following");
  const ids = follows.map(f => f.following);

  const [items, total] = await Promise.all([
    Post.find({ author: { $in: ids } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username avatarUrl"),
    Post.countDocuments({ author: { $in: ids } })
  ]);

  const userId = req.user._id;
  let enriched = items.map((p) => (typeof p.toObject === "function" ? p.toObject() : p));
  if (enriched.length) {
    const postIds = enriched.map((p) => p._id);
    const myLikes = await Like.find({ user: userId, post: { $in: postIds } }).select("post").lean();
    const likedSet = new Set(myLikes.map((l) => String(l.post)));
    enriched = enriched.map((p) => ({ ...p, likedByMe: likedSet.has(String(p._id)) }));
  }

  res.json({ page, limit, total, items: enriched });
});

module.exports = router;
