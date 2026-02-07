const router = require("express").Router();
const { auth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { updateCommentSchema } = require("./comment.validators");
const ctrl = require("./comment.controller");

router.use(auth);
router.put("/:commentId", validate(updateCommentSchema), ctrl.update);
router.delete("/:commentId", ctrl.remove);

module.exports = router;
