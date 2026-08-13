"use server"

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { store, InsertStore, storeSettings, InsertStoreSettings } from "@/db/schema";
import { eq } from "drizzle-orm"; 

type StoreSettingsInput = Omit<
    InsertStoreSettings,
    "id" | "storeId" | "createdAt" | "updatedAt"
>;

export async function createStoreSettings(
    storeData: InsertStore,
    storeSettingsData: StoreSettingsInput ) {
    try {
        const [createdStore] = await db.insert(store).values(storeData).returning();
        const [createdStoreSettings] = await db.insert(storeSettings).values({
            ...storeSettingsData,
            storeId: createdStore.id,
        }).returning();

        return { store: createdStore, settings: createdStoreSettings };
    } catch (error) {
        console.error("Error storing settings:", error);
        throw new Error("Failed to store settings");
    }

}

export async function updateStoreSettings(
    storeId: string,
    storeSettingsId: string,
    storeData: Partial<InsertStore>,
    storeSettingsData: Partial<StoreSettingsInput>
) {
    try {
        const [updatedStore] = await db.update(store).set(storeData).where(eq(store.id, storeId)).returning();
        if (!updatedStore) {
            throw new Error("Store not found");
        }

        const [existingSettings] = await db.select({ id: storeSettings.id })
            .from(storeSettings)
            .where(eq(storeSettings.storeId, storeId));

        const [updatedStoreSettings] = existingSettings
            ? await db.update(storeSettings)
                .set(storeSettingsData)
                .where(eq(storeSettings.id, storeSettingsId))
                .returning()
            : await db.insert(storeSettings)
                .values({ ...storeSettingsData, storeId })
                .returning();

        revalidatePath("/dashboard/settings/store");

        return { store: updatedStore, settings: updatedStoreSettings };
    } catch (error) {
        console.error("Error updating store settings:", error);
        throw new Error("Failed to update store settings");
    }
}

export async function getStoreSettings() {
    try {
        const storeData = await db.query.store.findFirst();
        const storeSettingsData = storeData
            ? await db.query.storeSettings.findFirst({
                where: eq(storeSettings.storeId, storeData.id),
            })
            : null;
        return { store: storeData, settings: storeSettingsData };
    } catch (error) {
      console.error("Error fetching store settings:", error);
      return { store: null, settings: null };
    }
}