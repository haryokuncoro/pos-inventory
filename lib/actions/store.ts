import { cache } from "react";
import { db } from "@/db/drizzle";
import { store, storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

/*
 * Per-request memoisation via React cache() rather than unstable_cache: the
 * incremental cache writes to .next/cache, which is read-only for a packaged
 * desktop app installed in a system directory. These are two indexed
 * single-row lookups, so a request-scoped cache is ample.
 */

const getCachedStore = cache(async () => {
  const [result] = await db
    .select({
      id: store.id,
    })
    .from(store)
    .where(eq(store.isActive, true))
    .limit(1);

  if (!result) {
    throw new Error("No active store configured.");
  }

  return result;
});

const getCachedStoreWithSettings = cache(async () => {
  const currentStore = await db.query.store.findFirst({
    where: eq(store.isActive, true),
  });

  if (!currentStore) {
    throw new Error("No active store configured.");
  }

  const settings = await db.query.storeSettings.findFirst({
    where: eq(storeSettings.storeId, currentStore.id),
  });

  return { store: currentStore, settings: settings ?? null };
});

export async function getCurrentStoreId() {
  const currentStore = await getCachedStore();

  return currentStore.id;
}

export async function getCurrentStore() {
  return getCachedStoreWithSettings();
}
