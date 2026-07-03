import "dotenv/config";
import { defineConfig } from "drizzle-kit";

console.log("DIRECT_URL =", process.env.DIRECT_URL);

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
});

// initial step

