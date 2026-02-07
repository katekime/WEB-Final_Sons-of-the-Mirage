const router = require("express").Router();
const { auth } = require("../../middleware/auth");
const ctrl = require("./follow.controller");

router.use(auth);

router.post("/:userId", ctrl.follow);
router.delete("/:userId", ctrl.unfollow);

module.exports = router;
