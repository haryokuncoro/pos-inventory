"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import {
  store,
  InsertStore,
  storeSettings,
  InsertStoreSettings,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { withErrorHandling } from "@/lib/helper";
import { getCurrentStoreId } from "./store";

const STORE_SETTINGS_PATH = "/dashboard/settings/store";

type StoreSettingsInput = Omit<
  InsertStoreSettings,
  "id" | "storeId" | "createdAt" | "updatedAt"
>;

export async function createStoreSettings(
  storeData: InsertStore,
  storeSettingsData: StoreSettingsInput,
) {
  return withErrorHandling("creating store settings", async () => {
    const [createdStore] = await db.insert(store).values(storeData).returning();
    const [createdStoreSettings] = await db
      .insert(storeSettings)
      .values({
        ...storeSettingsData,
        storeId: createdStore.id,
      })
      .returning();

    return { store: createdStore, settings: createdStoreSettings };
  });
}

export async function updateStoreSettings(
  storeId: string,
  storeSettingsId: string,
  storeData: Partial<InsertStore>,
  storeSettingsData: Partial<StoreSettingsInput>,
) {
  return withErrorHandling(
    `updating store settings for store with id ${storeId}`,
    async () => {
      const [updatedStore] = await db
        .update(store)
        .set(storeData)
        .where(eq(store.id, storeId))
        .returning();
      if (!updatedStore) {
        throw new Error("Store not found");
      }

      const [existingSettings] = await db
        .select({ id: storeSettings.id })
        .from(storeSettings)
        .where(eq(storeSettings.storeId, storeId));

      const [updatedStoreSettings] = existingSettings
        ? await db
            .update(storeSettings)
            .set(storeSettingsData)
            .where(eq(storeSettings.id, storeSettingsId))
            .returning()
        : await db
            .insert(storeSettings)
            .values({ ...storeSettingsData, storeId })
            .returning();

      revalidatePath(STORE_SETTINGS_PATH);

      return { store: updatedStore, settings: updatedStoreSettings };
    },
  );
}

export async function getStoreSettings() {
  return withErrorHandling("fetching store settings", async () => {
    const storeId = await getCurrentStoreId();
    const storeData = await db.query.store.findFirst({
      where: eq(store.id, storeId),
    });
    const storeSettingsData = storeData
      ? await db.query.storeSettings.findFirst({
          where: eq(storeSettings.storeId, storeData.id),
        })
      : null;
    return { store: storeData, settings: storeSettingsData };
  });
}
