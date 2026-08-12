import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import { config } from "dotenv";
import * as schema from "@/db/schema";

config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const db =
  process.env.NODE_ENV === "production"
    ? neonDrizzle({
        client: neon(databaseUrl),
        schema,
      })
    : pgDrizzle(
        new Pool({
          connectionString: databaseUrl,
        }),
        { schema }
      );

export { db };