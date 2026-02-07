const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/error");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const postRoutes = require("./modules/posts/post.routes");
const followRoutes = require("./modules/follows/follow.routes");
const feedRoutes = require("./modules/feed/feed.routes");
const commentRoutes = require("./modules/comments/comment.routes.root");
const adminRoutes = require("./modules/admin/admin.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


app.use(notFound);
app.use(errorHandler);

module.exports = app;
