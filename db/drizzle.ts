import path from "path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePGlite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

declare global {
  var _pglite: PGlite | undefined;
  var _pgPool: Pool | undefined;
}

function createDb() {
  if (process.env.USE_PGLITE === "true") {
    const client =
      global._pglite ??
      new PGlite(path.join(process.cwd(), "data/.pglite"));
    if (process.env.NODE_ENV !== "production") global._pglite = client;
    return drizzlePGlite(client, { schema });
  }

  const pool =
    global._pgPool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  if (process.env.NODE_ENV !== "production") global._pgPool = pool;
  return drizzlePg(pool, { schema });
}

const db = createDb();

export { db };