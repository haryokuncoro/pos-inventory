"use server";

import { db } from "@/db/drizzle";
import {
  category,
  product,
  productVariant,
  inventoryTransaction,
} from "@/db/schema";
import { getCurrentStoreId } from "../store";
import { inArray } from "drizzle-orm";
import {
  productImportRowSchema,
  type ProductImportRow,
} from "@/lib/validations/product";

export async function importProducts(rows: unknown[], userId: string) {
  const storeId = await getCurrentStoreId();

  const validatedRows: ProductImportRow[] = rows.map((row) =>
    productImportRowSchema.parse(row),
  );

  if (validatedRows.length === 0) {
    throw new Error("No products to import");
  }

  return db.transaction(async (tx) => {
    /*
     * 1. Check duplicate SKU inside CSV
     */
    const skuSet = new Set<string>();
    const duplicateSkus = new Set<string>();

    for (const row of validatedRows) {
      if (skuSet.has(row.sku)) {
        duplicateSkus.add(row.sku);
      }

      skuSet.add(row.sku);
    }

    if (duplicateSkus.size > 0) {
      throw new Error(
        `Duplicate SKU in CSV: ${Array.from(duplicateSkus).join(", ")}`,
      );
    }

    /*
     * 2. Find SKUs that already exist in the database.
     */
    const skus = validatedRows.map((row) => row.sku);

    const existingVariants = await tx.query.productVariant.findMany({
      where: inArray(productVariant.sku, skus),
      columns: {
        sku: true,
      },
    });

    const existingSkuSet = new Set(
      existingVariants.map((variant) => variant.sku),
    );

    const rowsToImport = validatedRows.filter(
      (row) => !existingSkuSet.has(row.sku),
    );

    const failedCount = validatedRows.length - rowsToImport.length;

    /*
     * Nothing new to import.
     */
    if (rowsToImport.length === 0) {
      const respone = {
        success: false,
        message: `No new products to import. ${failedCount} SKUs already exist.`,
        productCount: 0,
        variantCount: 0,
        inventoryTransactionCount: 0,
        successCount: 0,
        failedCount,
        skippedSkus: Array.from(existingSkuSet),
      };
      console.log("No new products to import. Returning response:", respone);
      return respone;
    }

    /*
     * 3. Load all required categories once
     */
    const categoryNames = [
      ...new Set(rowsToImport.map((row) => row.category)),
    ];

    const existingCategories = await tx.query.category.findMany({
      where: inArray(category.name, categoryNames),
    });

    const categoryMap = new Map(
      existingCategories.map((item) => [item.name, item]),
    );

    /*
     * 4. Create missing categories
     */
    for (const categoryName of categoryNames) {
      if (categoryMap.has(categoryName)) {
        continue;
      }

      const [createdCategory] = await tx
        .insert(category)
        .values({
          storeId,
          name: categoryName,
        })
        .returning();

      categoryMap.set(categoryName, createdCategory);
    }

    /*
     * 5. Group CSV rows by product identity
     * Product identity: name + category
     */
    const productGroups = new Map<string, ProductImportRow[]>();

    for (const row of rowsToImport) {
      const key = `${row.name.trim().toLowerCase()}::${row.category
        .trim()
        .toLowerCase()}`;

      const group = productGroups.get(key);

      if (group) {
        group.push(row);
      } else {
        productGroups.set(key, [row]);
      }
    }

    /*
     * 6. Validate duplicate variant name
     */
    for (const rows of productGroups.values()) {
      const variantNameSet = new Set<string>();

      for (const row of rows) {
        const variantKey = row.variantName.trim().toLowerCase();

        if (variantNameSet.has(variantKey)) {
          throw new Error(
            `Duplicate variant "${row.variantName}" for product "${row.name}"`,
          );
        }

        variantNameSet.add(variantKey);
      }
    }

    /*
     * 7. Create products and variants
     */
    let productCount = 0;
    let variantCount = 0;
    let inventoryTransactionCount = 0;

    for (const productRows of productGroups.values()) {
      const firstRow = productRows[0];

      const categoryRecord = categoryMap.get(firstRow.category);

      if (!categoryRecord) {
        throw new Error(`Category not found: ${firstRow.category}`);
      }

      /*
       * Create ONE product for the group.
       */
      const [createdProduct] = await tx
        .insert(product)
        .values({
          storeId,
          categoryId: categoryRecord.id,
          name: firstRow.name,
        })
        .returning();

      productCount++;

      /*
       * Create variants.
       */
      for (const row of productRows) {
        const [createdVariant] = await tx
          .insert(productVariant)
          .values({
            productId: createdProduct.id,
            sku: row.sku,
            name: row.variantName,
            costPrice: row.costPrice.toString(),
            sellingPrice: row.sellingPrice.toString(),
            stockQuantity: row.stockQuantity,
          })
          .onConflictDoNothing({
            target: productVariant.sku,
          })
          .returning();

        /*
         * Should only happen if the SKU became a duplicate
         * between our initial query and this insert.
         */
        if (!createdVariant) {
          continue;
        }

        variantCount++;

        /*
         * Create initial inventory transaction.
         */
        if (row.stockQuantity > 0) {
          await tx.insert(inventoryTransaction).values({
            variantId: createdVariant.id,
            type: "ADJUSTMENT_IN",
            quantity: row.stockQuantity,
            referenceType: "PRODUCT_IMPORT",
            referenceId: createdVariant.id,
            reason: "Initial stock import",
            createdBy: userId,
          });

          inventoryTransactionCount++;
        }
      }
    }

    const response = {
      success: true,
      message: `Imported ${productCount} products and ${variantCount} variants. Created ${inventoryTransactionCount} inventory transactions.`,
      productCount,
      variantCount,
      inventoryTransactionCount,
      successCount: variantCount,
      failedCount: validatedRows.length - variantCount,
      skippedSkus: Array.from(existingSkuSet),
    };
    console.log("Import summary:", response);
    return response;

  });
}