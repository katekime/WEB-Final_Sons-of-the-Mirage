const router = require("express").Router({ mergeParams: true });
const ctrl = require("./like.controller");

// Auth is already applied by parent (post.routes.js -> router.use(auth))
router.post("/", ctrl.like);
router.delete("/", ctrl.unlike);

module.exports = router;
