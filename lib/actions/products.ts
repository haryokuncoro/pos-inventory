"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { product, InsertProduct, category } from "@/db/schema";
import { eq } from "drizzle-orm";

type CreateProductInput = Omit<
  InsertProduct,
  "id" | "createdAt" | "updatedAt"
>;

type UpdateProductInput = Partial<
  Omit<InsertProduct, "id" | "createdAt" | "updatedAt">
>;

type ProductWithCategory = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string | null;
};

export async function getAllProducts(): Promise<ProductWithCategory[]> {
  try {
    return await db
      .select({
        id: product.id,
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        categoryName: category.name,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
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

export async function createProduct(productData: CreateProductInput) {
  try {
    const [createdProduct] = await db
      .insert(product)
      .values(productData)
      .returning();

    revalidatePath("/dashboard/product");
    return createdProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}

export async function updateProduct(id: string, productData: UpdateProductInput) {
  try {
    const [updatedProduct] = await db
      .update(product)
      .set(productData)
      .where(eq(product.id, id))
      .returning();

    revalidatePath("/dashboard/product");
    return updatedProduct;
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw new Error(`Failed to update product with id ${id}`);
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.delete(product).where(eq(product.id, id));
    revalidatePath("/dashboard/product");
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw new Error(`Failed to delete product with id ${id}`);
  }
}