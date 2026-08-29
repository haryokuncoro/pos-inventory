import { unstable_cache } from "next/cache";
import { db } from "@/db/drizzle";
import { store, storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const getCachedStore = unstable_cache(
  async () => {
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
  },
  ["current-store"],
  {
    revalidate: 1800, // 30 minutes
  },
);

const getCachedStoreWithSettings = unstable_cache(
  async () => {
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
  },
  ["current-store-settings"],
  {
    revalidate: 1800, // 30 minutes
  },
);

export async function getCurrentStoreId() {
  const currentStore = await getCachedStore();

  return currentStore.id;
}

export async function getCurrentStore() {
  return getCachedStoreWithSettings();
}
