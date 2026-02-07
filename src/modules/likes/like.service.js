const Like = require("./like.model");
const Post = require("../posts/post.model");
const { createNotification } = require("../notifications/notification.service");

async function likePost(userId, postId) {
  const exists = await Like.findOne({ user: userId, post: postId }).lean();
  if (exists) {
    return { ok: true, liked: true, already: true };
  }

  try {
    await Like.create({ user: userId, post: postId });
  } catch (err) {
    if (err.code === 11000) return { ok: true, liked: true, already: true };
    throw err;
  }

  const realCount = await Like.countDocuments({ post: postId });
  await Post.findByIdAndUpdate(postId, { likesCount: realCount });

  try {
    const post = await Post.findById(postId).select("author");
    if (post && post.author) {
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: "like",
        post: postId,
      });
    }
  } catch (_) {  }

  return { ok: true, liked: true };
}

async function unlikePost(userId, postId) {
  const deleted = await Like.findOneAndDelete({ user: userId, post: postId });
  if (deleted) {
    const realCount = await Like.countDocuments({ post: postId });
    await Post.findByIdAndUpdate(postId, { likesCount: realCount });
  }
  return { ok: true };
}

module.exports = { likePost, unlikePost };
