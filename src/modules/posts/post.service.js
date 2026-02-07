const Post = require("./post.model");

function canEditOrDelete(user, postAuthorId) {
  if (String(user._id) === String(postAuthorId)) return true;
  if (user.role === "admin" || user.role === "moderator") return true;
  return false;
}

async function createPost(userId, data) {
  return Post.create({ ...data, author: userId });
}

async function listPosts({ skip, limit, author }) {
  const filter = author ? { author } : {};
  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username avatarUrl"),
    Post.countDocuments(filter)
  ]);
  return { items, total };
}

async function getPostById(id) {
  const post = await Post.findById(id).populate("author", "username avatarUrl");
  if (!post) {
    const err = new Error("Post not found");
    err.status = 404;
    throw err;
  }
  return post;
}

async function updatePost(user, id, data) {
  const post = await Post.findById(id);
  if (!post) {
    const err = new Error("Post not found");
    err.status = 404;
    throw err;
  }
  if (!canEditOrDelete(user, post.author)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  Object.assign(post, data);
  await post.save();
  return post;
}

async function deletePost(user, id) {
  const post = await Post.findById(id);
  if (!post) {
    const err = new Error("Post not found");
    err.status = 404;
    throw err;
  }
  if (!canEditOrDelete(user, post.author)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  await post.deleteOne();
  return { ok: true };
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost };
