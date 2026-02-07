
require("dotenv").config();
const mongoose = require("mongoose");
const { env } = require("../src/config/env");

const Post = require("../src/modules/posts/post.model");
const Like = require("../src/modules/likes/like.model");

async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB");

  const posts = await Post.find().select("_id likesCount");
  console.log(`Found ${posts.length} posts. Recalculating...`);

  let fixed = 0;
  for (const post of posts) {
    const realCount = await Like.countDocuments({ post: post._id });
    if (post.likesCount !== realCount) {
      await Post.updateOne({ _id: post._id }, { likesCount: realCount });
      console.log(`  Post ${post._id}: ${post.likesCount} -> ${realCount}`);
      fixed++;
    }
  }

  console.log(`Done. Fixed ${fixed} posts.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
