import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Read the URL from .env when Prisma CLI runs
    // If DATABASE_URL is missing, Prisma commands that need a DB will fail.
    url: process.env.DATABASE_URL ?? "",
  },
});

// import { defineConfig } from "prisma/config";

// export default defineConfig({
//   schema: "prisma/schema.prisma",
//   migrate: {
//     path: "prisma/migrations",
//   },
//   db: {
//     url: process.env.DATABASE_URL,
//   },
// });
