const router = require("express").Router({ mergeParams: true });
const { validate } = require("../../middleware/validate");
const { createCommentSchema, updateCommentSchema } = require("./comment.validators");
const ctrl = require("./comment.controller");

router.post("/", validate(createCommentSchema), ctrl.add);
router.get("/", ctrl.list);

module.exports = router;
