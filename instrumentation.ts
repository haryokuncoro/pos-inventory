/**
 * register() runs once per server instance and completes before the server
 * starts handling requests, so no server action can observe a pre-migration
 * schema on the desktop build.
 *
 * The dynamic import keeps PGlite and the seed data out of the edge
 * compilation entirely.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { prepareLocalDatabase } = await import("@/db/bootstrap");

  await prepareLocalDatabase();
}
