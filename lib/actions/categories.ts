"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { withErrorHandling } from "@/lib/helper";
import { categorySchema } from "@/lib/validations/category";

const CATEGORY_PATH = "/dashboard/categories";

type CreateCategoryInput = z.infer<typeof categorySchema>;
type UpdateCategoryInput = z.infer<typeof categorySchema>;

export async function getAllCategories() {
  return withErrorHandling("fetching categories", () =>
    db.select().from(category)
  );
}

export async function getCategoryById(id: string) {
  return withErrorHandling(`fetching category with id ${id}`, async () => {
    const [result] = await db
      .select()
      .from(category)
      .where(eq(category.id, id));

    return result ?? null;
  });
}

export async function createCategory(input: CreateCategoryInput) {
  return withErrorHandling("creating category", async () => {
    const categoryData = categorySchema.parse(input);

    const [createdCategory] = await db
      .insert(category)
      .values(categoryData)
      .returning();

    revalidatePath(CATEGORY_PATH);
    return createdCategory;
  });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  return withErrorHandling(`updating category with id ${id}`, async () => {
    const categoryData = categorySchema.parse(input);

    const [updatedCategory] = await db
      .update(category)
      .set(categoryData)
      .where(eq(category.id, id))
      .returning();

    revalidatePath(CATEGORY_PATH);
    return updatedCategory;
  });
}

export async function deleteCategory(id: string) {
  return withErrorHandling(`deleting category with id ${id}`, async () => {
    await db.delete(category).where(eq(category.id, id));
    revalidatePath(CATEGORY_PATH);
  });
}