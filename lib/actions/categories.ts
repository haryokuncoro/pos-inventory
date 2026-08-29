"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { category } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { withErrorHandling } from "@/lib/helper";
import { categorySchema } from "@/lib/validations/category";
import { getCurrentStoreId } from "./store";

const CATEGORY_PATH = "/dashboard/categories";

type CreateCategoryInput = z.infer<typeof categorySchema>;
type UpdateCategoryInput = z.infer<typeof categorySchema>;

export async function getAllCategories() {
  const storeId = await getCurrentStoreId();
  return withErrorHandling("fetching categories", async () =>
    db.select().from(category).where(eq(category.storeId, storeId)),
  );
}

export async function createCategory(input: CreateCategoryInput) {
  return withErrorHandling("creating category", async () => {
    const categoryData = categorySchema.parse(input);
    const storeId = await getCurrentStoreId();
    const [createdCategory] = await db
      .insert(category)
      .values({ ...categoryData, storeId })
      .returning();

    revalidatePath(CATEGORY_PATH);
    return createdCategory;
  });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  return withErrorHandling(`updating category with id ${id}`, async () => {
    const categoryData = categorySchema.parse(input);
    const storeId = await getCurrentStoreId();

    const [updatedCategory] = await db
      .update(category)
      .set(categoryData)
      .where(and(eq(category.id, id), eq(category.storeId, storeId)))
      .returning();

    if (!updatedCategory) {
      throw new Error("Category not found");
    }

    revalidatePath(CATEGORY_PATH);
    return updatedCategory;
  });
}

export async function deleteCategory(id: string) {
  return withErrorHandling(`deleting category with id ${id}`, async () => {
    const storeId = await getCurrentStoreId();
    const deletedCategories = await db
      .delete(category)
      .where(and(eq(category.id, id), eq(category.storeId, storeId)))
      .returning({ id: category.id });

    if (deletedCategories.length === 0) {
      throw new Error("Category not found");
    }

    revalidatePath(CATEGORY_PATH);
  });
}
