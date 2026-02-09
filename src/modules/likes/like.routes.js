const router = require("express").Router({ mergeParams: true });
const ctrl = require("./like.controller");

router.post("/", ctrl.like);
router.delete("/", ctrl.unlike);

module.exports = router;
