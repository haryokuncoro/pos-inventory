"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import {
  product,
  productVariant,
  InsertProduct,
  InsertProductVariant,
  category,
} from "@/db/schema";
import { eq, ilike, inArray, or, sql, desc } from "drizzle-orm";

type CreateProductInput = Omit<
  InsertProduct,
  "id" | "createdAt" | "updatedAt"
>;

type UpdateProductInput = Partial<
  Omit<InsertProduct, "id" | "createdAt" | "updatedAt">
>;

type CreateProductVariantInput = Omit<
  InsertProductVariant,
  "id" | "productId" | "createdAt" | "updatedAt"
>;

export type ProductVariantInput = CreateProductVariantInput & {
  id?: string;
};

export type ProductWithCategoryAndVariants = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string | null;

  variants: {
    id: string;
    productId: string;
    sku: string;
    name: string;
    costPrice: string;
    sellingPrice: string;
    stockQuantity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export type GetProductsPaginatedInput = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type PaginatedProductsResult = {
  items: ProductWithCategoryAndVariants[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

/**
 * Get products with server-side pagination and search.
 */
export async function getProductsPaginated(
  input: GetProductsPaginatedInput = {},
): Promise<PaginatedProductsResult> {
  try {
    const pageSize = Math.min(Math.max(input.pageSize ?? 5, 1), 100);
    const requestedPage = Math.max(input.page ?? 1, 1);
    const normalizedQuery = input.query?.trim() ?? "";
    const keyword = `%${normalizedQuery}%`;

    const whereCondition = normalizedQuery
      ? or(
          ilike(product.name, keyword),
          ilike(category.name, keyword),
          sql`exists (
            select 1
            from ${productVariant}
            where ${productVariant.productId} = ${product.id}
              and (
                ${productVariant.name} ilike ${keyword}
                or ${productVariant.sku} ilike ${keyword}
              )
          )`,
        )
      : undefined;

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(whereCondition);

    const totalItems = Number(count ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * pageSize;

    const products = await db
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
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(whereCondition)
      .orderBy(desc(product.createdAt))
      .limit(pageSize)
      .offset(offset);

    const productIds = products.map((item) => item.id);

    const variants =
      productIds.length > 0
        ? await db
            .select({
              id: productVariant.id,
              productId: productVariant.productId,
              sku: productVariant.sku,
              name: productVariant.name,
              costPrice: productVariant.costPrice,
              sellingPrice: productVariant.sellingPrice,
              stockQuantity: productVariant.stockQuantity,
              isActive: productVariant.isActive,
              createdAt: productVariant.createdAt,
              updatedAt: productVariant.updatedAt,
            })
            .from(productVariant)
            .where(inArray(productVariant.productId, productIds))
            .orderBy(desc(productVariant.createdAt))
        : [];

    const variantsByProductId = variants.reduce<
      Record<string, ProductWithCategoryAndVariants["variants"]>
    >((accumulator, variant) => {
      if (!accumulator[variant.productId]) {
        accumulator[variant.productId] = [];
      }

      accumulator[variant.productId].push(variant);
      return accumulator;
    }, {});

    const items = products.map((item) => ({
      ...item,
      variants: variantsByProductId[item.id] ?? [],
    }));

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    throw new Error("Failed to fetch paginated products");
  }
}

/**
 * Get all products with their variants.
 */
export async function getAllProducts(): Promise<
  ProductWithCategoryAndVariants[]
> {
  try {
    const products = await db
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

    const variants = await db
      .select({
        id: productVariant.id,
        productId: productVariant.productId,
        sku: productVariant.sku,
        name: productVariant.name,
        costPrice: productVariant.costPrice,
        sellingPrice: productVariant.sellingPrice,
        stockQuantity: productVariant.stockQuantity,
        isActive: productVariant.isActive,
        createdAt: productVariant.createdAt,
        updatedAt: productVariant.updatedAt,
      })
      .from(productVariant);

    return products.map((product) => ({
      ...product,
      variants: variants.filter(
        (variant) => variant.productId === product.id,
      ),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Get category by ID.
 */
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

/**
 * Create product with variants.
 */
export async function createProduct(
  productData: CreateProductInput,
  variants: CreateProductVariantInput[],
) {
  try {
    const [createdProduct] = await db
      .insert(product)
      .values(productData)
      .returning();

    if (!createdProduct) {
      throw new Error("Failed to create product");
    }

    const createdVariants: typeof productVariant.$inferSelect[] =
      variants.length > 0
        ? await db
            .insert(productVariant)
            .values(
              variants.map((variant) => ({
                ...variant,
                productId: createdProduct.id,
              })),
            )
            .returning()
        : [];

    revalidatePath("/dashboard/product");

    return {
      product: createdProduct,
      variants: createdVariants,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}

/**
 * Update product and its variants.
 *
 * Existing variants are updated.
 * New variants are created.
 * Variants removed from the request are deleted.
 */
export async function updateProduct(
  id: string,
  productData: UpdateProductInput,
  variants: ProductVariantInput[],
) {
  try {
    const [updatedProduct] = await db
      .update(product)
      .set(productData)
      .where(eq(product.id, id))
      .returning();

    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    const existingVariants = await db
      .select()
      .from(productVariant)
      .where(eq(productVariant.productId, id));

    const incomingVariantIds = variants
      .filter((variant) => variant.id)
      .map((variant) => variant.id!);

    /**
     * Delete variants that no longer exist in the form.
     */
    for (const existingVariant of existingVariants) {
      if (!incomingVariantIds.includes(existingVariant.id)) {
        await db
          .delete(productVariant)
          .where(eq(productVariant.id, existingVariant.id));
      }
    }

    const savedVariants: typeof productVariant.$inferSelect[] = [];

    /**
     * Update existing variants or create new ones.
     */
    for (const variant of variants) {
      if (variant.id) {
        const { id: variantId, ...variantData } = variant;

        const [updatedVariant] = await db
          .update(productVariant)
          .set(variantData)
          .where(eq(productVariant.id, variantId))
          .returning();

        if (updatedVariant) {
          savedVariants.push(updatedVariant);
        }
      } else {
        const { id: ignoredId, ...variantData } = variant;
        void ignoredId;

        const [createdVariant] = await db
          .insert(productVariant)
          .values({
            ...variantData,
            productId: id,
          })
          .returning();

        if (createdVariant) {
          savedVariants.push(createdVariant);
        }
      }
    }

    revalidatePath("/dashboard/product");

    return {
      product: updatedProduct,
      variants: savedVariants,
    };
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw new Error(`Failed to update product with id ${id}`);
  }
}

/**
 * Delete product.
 *
 * productVariant.productId has ON DELETE CASCADE,
 * so its variants are automatically deleted.
 */
export async function deleteProduct(id: string) {
  try {
    await db.delete(product).where(eq(product.id, id));

    revalidatePath("/dashboard/product");
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw new Error(`Failed to delete product with id ${id}`);
  }
}
