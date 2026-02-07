const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { auth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { updateProfileSchema } = require("./user.validators");
const ctrl = require("./user.controller");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../../uploads/avatars"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only images allowed"), ok);
  },
});

router.get("/search", ctrl.search);
router.put("/profile", auth, validate(updateProfileSchema), ctrl.updateProfile);
router.post("/avatar", auth, upload.single("avatar"), ctrl.uploadAvatar);

router.get("/:username", ctrl.getByUsername);

module.exports = router;
