import fs from "node:fs";
import path from "node:path";

import { neon } from "@neondatabase/serverless";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import { drizzle as pgliteDrizzle } from "drizzle-orm/pglite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "@/db/schema";

/**
 * The single database type the whole app is written against. PgliteDatabase and
 * NodePgDatabase both extend PgDatabase and differ only in their query-result
 * HKT, which this codebase never observes (no db.execute(), no rowCount, no
 * $client), so the query builder API is identical across both.
 */
export type AppDatabase = NodePgDatabase<typeof schema>;

export type DbDriver = "pglite" | "neon-http" | "node-postgres";

/**
 * Driver selection is explicit via DB_DRIVER rather than derived from NODE_ENV,
 * because the Next standalone server hardcodes NODE_ENV=production - so the
 * packaged desktop app cannot be distinguished from a web deployment that way.
 *
 * With DB_DRIVER unset we keep the historical web behaviour, so the existing
 * deployment needs no new environment variable.
 */
export function resolveDbDriver(): DbDriver {
  const requested = process.env.DB_DRIVER;

  if (
    requested === "pglite" ||
    requested === "neon-http" ||
    requested === "node-postgres"
  ) {
    return requested;
  }

  if (requested) {
    throw new Error(
      `Unsupported DB_DRIVER "${requested}". Expected pglite, neon-http or node-postgres.`,
    );
  }

  return process.env.NODE_ENV === "production" ? "neon-http" : "node-postgres";
}

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined`);
  }

  return value;
}

type DatabaseHandles = {
  driver: DbDriver;
  db: AppDatabase;
  /** Correctly typed handle for drizzle-orm/pglite/migrator. */
  pglite?: PgliteDatabase<typeof schema>;
};

function createHandles(): DatabaseHandles {
  const driver = resolveDbDriver();

  if (driver === "pglite") {
    const dataDir = requireEnv("PGLITE_DATA_DIR");

    // PGlite's node filesystem creates the data directory with a non-recursive
    // mkdir, so its parent has to exist first.
    fs.mkdirSync(path.dirname(path.resolve(dataDir)), { recursive: true });

    // new PGlite() returns synchronously and gates every query on its internal
    // waitReady promise, so db can stay a synchronous module-level export.
    const client = new PGlite(dataDir);
    const pglite = pgliteDrizzle({ client, schema });

    return {
      driver,
      pglite,
      db: pglite as unknown as AppDatabase,
    };
  }

  if (driver === "neon-http") {
    return {
      driver,
      db: neonDrizzle({
        client: neon(requireEnv("DATABASE_URL")),
        schema,
      }) as unknown as AppDatabase,
    };
  }

  return {
    driver,
    db: pgDrizzle(new Pool({ connectionString: requireEnv("DATABASE_URL") }), {
      schema,
    }),
  };
}

/**
 * Pinned on globalThis because Next compiles instrumentation.ts and the route
 * bundles separately, and dev HMR re-evaluates modules. Two module instances
 * would mean two PGlite instances mounting the same data directory.
 */
const globalForDb = globalThis as unknown as {
  __posDatabase?: DatabaseHandles;
};

const handles = (globalForDb.__posDatabase ??= createHandles());

export const dbDriver = handles.driver;
export const pgliteDb = handles.pglite;
export const db = handles.db;
