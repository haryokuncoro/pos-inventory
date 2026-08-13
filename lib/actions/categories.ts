"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { category, InsertCategory } from "@/db/schema";
import { eq } from "drizzle-orm";

type CreateCategoryInput = Omit<
  InsertCategory,
  "id" | "createdAt" | "updatedAt"
>;

type UpdateCategoryInput = Partial<
  Omit<InsertCategory, "id" | "createdAt" | "updatedAt">
>;

export async function getAllCategories() {
  try {
    return await db.select().from(category);
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getCategoryById(id: string) {
  try {
    return await db
      .select()
      .from(category)
      .where(eq(category.id, id));
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    throw new Error(`Failed to fetch category with id ${id}`);
  }
}

export async function createCategory(
  categoryData: CreateCategoryInput
) {
  try {
    const [createdCategory] = await db
      .insert(category)
      .values(categoryData)
      .returning();

    revalidatePath("/dashboard/category");
    return createdCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

export async function updateCategory(
  id: string,
  categoryData: UpdateCategoryInput
) {
  try {
    const [updatedCategory] = await db
      .update(category)
      .set(categoryData)
      .where(eq(category.id, id))
      .returning();

    revalidatePath("/dashboard/category");
    return updatedCategory;
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    throw new Error(`Failed to update category with id ${id}`);
  }
}

export async function deleteCategory(id: string) {
  try {
    await db
      .delete(category)
      .where(eq(category.id, id));
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    throw new Error(`Failed to delete category with id ${id}`);
  }
}