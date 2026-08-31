import path from "node:path";

import { migrate } from "drizzle-orm/pglite/migrator";

import { db, dbDriver, pgliteDb } from "@/db/drizzle";
import { store } from "@/db/schema";
import { seedDatabase } from "@/db/seed";

function resolveMigrationsFolder() {
  // Packaged desktop: an absolute path injected by electron/main.cjs, so this
  // never depends on Next's file tracing or on the process working directory.
  // Otherwise cwd is the project root in dev and the standalone directory in
  // production, because the standalone server chdirs to its own location.
  return (
    process.env.MIGRATIONS_DIR ?? path.join(process.cwd(), "migrations")
  );
}

/** Applies pending migrations to the local database. No-op on Postgres. */
export async function migrateLocalDatabase() {
  if (!pgliteDb) {
    return;
  }

  await migrate(pgliteDb, {
    migrationsFolder: resolveMigrationsFolder(),
  });
}

async function run() {
  if (dbDriver !== "pglite") {
    return;
  }

  await migrateLocalDatabase();

  // The app requires an active store row, so a fresh install has to seed
  // itself. Existing data is left untouched.
  const [existingStore] = await db
    .select({
      id: store.id,
    })
    .from(store)
    .limit(1);

  if (!existingStore) {
    console.log("Local database is empty, seeding master data...");

    await seedDatabase();
  }
}

/**
 * Memoised on globalThis so a second caller awaits the same promise rather than
 * racing a concurrent migration.
 */
const globalForBootstrap = globalThis as unknown as {
  __posDatabaseBootstrap?: Promise<void>;
};

export function prepareLocalDatabase() {
  return (globalForBootstrap.__posDatabaseBootstrap ??= run());
}
