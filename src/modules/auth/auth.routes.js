const router = require("express").Router();
const { validate } = require("../../middleware/validate");
const { auth } = require("../../middleware/auth");
const ctrl = require("./auth.controller");
const { registerSchema, loginSchema } = require("./auth.validators");

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);

router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
