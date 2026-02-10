// src/server.js
require("dotenv").config();

const app = require("./app");
const prisma = require("./prisma");

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
