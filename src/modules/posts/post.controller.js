const service = require("./post.service");
const Like = require("../likes/like.model");
const { parsePagination } = require("../../utils/pagination");

async function create(req, res) {
  try {
    const post = await service.createPost(req.user._id, req.body);
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function list(req, res) {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const author = req.query.author || null;
    const { items, total } = await service.listPosts({ skip, limit, author });

    const userId = req.user?._id;
    let enriched = items.map((p) => (typeof p.toObject === "function" ? p.toObject() : p));
    if (userId && enriched.length) {
      const postIds = enriched.map((p) => p._id);
      const myLikes = await Like.find({ user: userId, post: { $in: postIds } }).select("post").lean();
      const likedSet = new Set(myLikes.map((l) => String(l.post)));
      enriched = enriched.map((p) => ({ ...p, likedByMe: likedSet.has(String(p._id)) }));
    }

    res.json({ page, limit, total, items: enriched });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getById(req, res) {
  try {
    const post = await service.getPostById(req.params.id);
    res.json({ post });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const post = await service.updatePost(req.user, req.params.id, req.body);
    res.json({ post });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const result = await service.deletePost(req.user, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { create, list, getById, update, remove };
