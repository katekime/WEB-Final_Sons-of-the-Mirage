const router = require("express").Router();
const { auth } = require("../../middleware/auth");
const ctrl = require("./notification.controller");

router.use(auth);

router.get("/",       ctrl.list);
router.post("/read",  ctrl.markRead);
router.get("/unread", ctrl.unreadCount);

module.exports = router;
