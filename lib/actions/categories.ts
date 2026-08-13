"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { category } from "@/db/schema";

import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validations/category";

import { handleAction } from "@/lib/helper";

const CATEGORY_PATH = "/dashboard/category";

export async function getAllCategories() {
  return handleAction(
    () => db.select().from(category),
    "Failed to fetch categories",
  );
}

export async function getCategoryById(id: string) {
  return handleAction(
    async () => {
      const [result] = await db
        .select()
        .from(category)
        .where(eq(category.id, id))
        .limit(1);

      if (!result) {
        throw new Error("Category not found");
      }

      return result;
    },
    "Failed to fetch category",
  );
}

export async function createCategory(
  input: CreateCategoryInput,
) {
  const data = createCategorySchema.parse(input);

  const result = await handleAction(
    async () => {
      const [createdCategory] = await db
        .insert(category)
        .values(data)
        .returning();

      return createdCategory;
    },
    "Failed to create category",
  );

  if (result.success) {
    revalidatePath(CATEGORY_PATH);
  }

  return result;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
) {
  const data = updateCategorySchema.parse(input);

  const result = await handleAction(
    async () => {
      const [updatedCategory] = await db
        .update(category)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(category.id, id))
        .returning();

      if (!updatedCategory) {
        throw new Error("Category not found");
      }

      return updatedCategory;
    },
    "Failed to update category",
  );

  if (result.success) {
    revalidatePath(CATEGORY_PATH);
  }

  return result;
}

export async function deleteCategory(id: string) {
  const result = await handleAction(
    async () => {
      const [deletedCategory] = await db
        .delete(category)
        .where(eq(category.id, id))
        .returning();

      if (!deletedCategory) {
        throw new Error("Category not found");
      }

      return deletedCategory;
    },
    "Failed to delete category",
  );

  if (result.success) {
    revalidatePath(CATEGORY_PATH);
  }

  return result;
}