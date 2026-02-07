const router = require("express").Router();
const { auth } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/role");
const User = require("../users/user.model");

router.use(auth);
router.use(requireRole("admin"));

router.put("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["user", "moderator", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

module.exports = router;
