import { unstable_cache } from "next/cache";
import { db } from "@/db/drizzle";
import { store } from "@/db/schema";
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
    revalidate: 3600,
  },
);

export async function getCurrentStoreId() {
  const currentStore = await getCachedStore();

  return currentStore.id;
}