import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { mkdirSync } from "fs";

config({ path: ".env" });

mkdirSync("./data", { recursive: true });

const drizzleConfig =
  process.env.USE_PGLITE === "true"
    ? defineConfig({
        schema: "./db/schema.ts",
        out: "./migrations",
        dialect: "postgresql",
        driver: "pglite",
        dbCredentials: {
          url: process.env.DATABASE_URL!,
        },
      })
    : defineConfig({
        schema: "./db/schema.ts",
        out: "./migrations",
        dialect: "postgresql",
        dbCredentials: {
          url: process.env.DATABASE_URL!,
        },
      });

export default drizzleConfig;