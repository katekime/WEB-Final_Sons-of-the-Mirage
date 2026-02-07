const router = require("express").Router();
const { auth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { createPostSchema, updatePostSchema } = require("./post.validators");
const ctrl = require("./post.controller");

const likeRoutes = require("../likes/like.routes");
const commentRoutes = require("../comments/comment.routes");

router.use(auth);

router.post("/", validate(createPostSchema), ctrl.create);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.put("/:id", validate(updatePostSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

router.use("/:id/like", likeRoutes);
router.use("/:id/comments", commentRoutes);

module.exports = router;
