"use server"

import { db } from "@/db/drizzle"
import {
  category,
  product,
  productVariant,
  inventoryTransaction,
} from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import {
  productImportRowSchema,
  type ProductImportRow,
} from "./import-product-schema"

export async function importProducts(
  rows: unknown[],
  userId: string,
) {
  const validatedRows: ProductImportRow[] =
    rows.map((row) =>
      productImportRowSchema.parse(row),
    )

  if (validatedRows.length === 0) {
    throw new Error("No products to import")
  }

  await db.transaction(async (tx) => {
    // --------------------------------
    // 1. Check duplicate SKU in CSV
    // --------------------------------

    const skuSet = new Set<string>()

    for (const row of validatedRows) {
      if (skuSet.has(row.sku)) {
        throw new Error(
          `Duplicate SKU in CSV: ${row.sku}`,
        )
      }

      skuSet.add(row.sku)
    }

    // --------------------------------
    // 2. Check SKU against database
    // --------------------------------

    const skus = validatedRows.map(
      (row) => row.sku,
    )

    const existingVariants =
      await tx.query.productVariant.findMany({
        where: inArray(
          productVariant.sku,
          skus,
        ),
        columns: {
          sku: true,
        },
      })

    if (existingVariants.length > 0) {
      throw new Error(
        `SKU already exists: ${existingVariants
          .map((item) => item.sku)
          .join(", ")}`,
      )
    }

    // --------------------------------
    // 3. Import each row
    // --------------------------------

    for (const row of validatedRows) {
      // ------------------------------
      // Find category
      // ------------------------------

      let categoryRecord =
        await tx.query.category.findFirst({
          where: eq(
            category.name,
            row.category,
          ),
        })

      // ------------------------------
      // Create category if not found
      // ------------------------------

      if (!categoryRecord) {
        const [createdCategory] =
          await tx
            .insert(category)
            .values({
              name: row.category,
            })
            .returning()

        categoryRecord = createdCategory
      }

      // ------------------------------
      // Create product
      // ------------------------------

      const [createdProduct] =
        await tx
          .insert(product)
          .values({
            categoryId:
              categoryRecord.id,

            name: row.name,
          })
          .returning()

      // ------------------------------
      // Create variant
      // ------------------------------

      const [createdVariant] =
        await tx
          .insert(productVariant)
          .values({
            productId:
              createdProduct.id,

            sku: row.sku,

            name: row.variantName,

            costPrice:
              row.costPrice.toString(),

            sellingPrice:
              row.sellingPrice.toString(),

            stockQuantity:
              row.stockQuantity,
          })
          .returning()

      // ------------------------------
      // Create inventory transaction
      // ------------------------------

      if (row.stockQuantity > 0) {
        await tx
          .insert(inventoryTransaction)
          .values({
            variantId:
              createdVariant.id,

            type: "ADJUSTMENT_IN",

            quantity:
              row.stockQuantity,

            referenceType:
              "PRODUCT_IMPORT",

            referenceId:
              createdVariant.id,

            reason:
              "Initial stock import",

            createdBy: userId,
          })
      }
    }
  })

  return {
    success: true,
    count: validatedRows.length,
  }
}