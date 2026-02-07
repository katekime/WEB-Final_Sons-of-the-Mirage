const Comment = require("./comment.model");
const Post = require("../posts/post.model");
const { createNotification } = require("../notifications/notification.service");

function canEdit(user, authorId) {
  if (String(user._id) === String(authorId)) return true;
  if (user.role === "admin" || user.role === "moderator") return true;
  return false;
}

async function addComment(userId, postId, text) {
  const comment = await Comment.create({ author: userId, post: postId, text });
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  // Notify post author about the comment
  try {
    const post = await Post.findById(postId).select("author");
    if (post && post.author) {
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: "comment",
        post: postId,
      });
    }
  } catch (_) { /* notification failure should not break comment */ }

  return comment;
}

async function listComments(postId, { skip, limit }) {
  const [items, total] = await Promise.all([
    Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username avatarUrl"),
    Comment.countDocuments({ post: postId })
  ]);
  return { items, total };
}

async function updateComment(user, commentId, text) {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const err = new Error("Comment not found");
    err.status = 404;
    throw err;
  }
  if (!canEdit(user, comment.author)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  comment.text = text;
  await comment.save();
  return comment;
}

async function deleteComment(user, commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const err = new Error("Comment not found");
    err.status = 404;
    throw err;
  }
  if (!canEdit(user, comment.author)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  await comment.deleteOne();
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
  return { ok: true };
}

module.exports = { addComment, listComments, updateComment, deleteComment };
