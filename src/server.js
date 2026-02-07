const { env } = require("./config/env");
const { connectDB } = require("./config/db");
const app = require("./app");

(async () => {
  await connectDB(env.MONGO_URI);

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
})();
