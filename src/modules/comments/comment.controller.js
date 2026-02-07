const service = require("./comment.service");
const { parsePagination } = require("../../utils/pagination");

async function add(req, res) {
  try {
    const comment = await service.addComment(req.user._id, req.params.id, req.body.text);
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function list(req, res) {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const { items, total } = await service.listComments(req.params.id, { skip, limit });
    res.json({ page, limit, total, items });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function update(req, res) {
  try {
    const comment = await service.updateComment(req.user, req.params.commentId, req.body.text);
    res.json({ comment });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const result = await service.deleteComment(req.user, req.params.commentId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { add, list, update, remove };
