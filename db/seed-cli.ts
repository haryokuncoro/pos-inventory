import { config } from "dotenv";

config({ path: ".env" });

async function main() {
  // Imported after dotenv so DB_DRIVER and DATABASE_URL are populated before
  // the database module resolves its driver at import time.
  const { migrateLocalDatabase } = await import("@/db/bootstrap");
  const { seedDatabase } = await import("@/db/seed");

  await migrateLocalDatabase(); // no-op unless DB_DRIVER=pglite
  await seedDatabase({ reset: true });
}

main().catch((error) => {
  console.error("Seeding failed:");
  console.error(error);

  process.exit(1);
});
