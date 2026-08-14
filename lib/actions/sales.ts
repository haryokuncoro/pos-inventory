"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, desc, eq, gte, ilike, inArray, or, sql } from "drizzle-orm";
import { generateInvoiceNumber } from "@/lib/helper";
import { auth } from "@/lib/auth";
import { money, roundMoney } from "@/lib/helper";
import { db } from "@/db/drizzle";
import {
  category,
  inventoryTransaction,
  payment,
  product,
  productVariant,
  sale,
  saleItem,
  user,
} from "@/db/schema";
import { getCurrentStoreId } from "./store";

// TYPES
export type CreateSaleItemInput = {
  variantId: string;
  quantity: number;
};

export type CreateSaleInput = {
  cashierId?: string;
  items: CreateSaleItemInput[];
  discountType?: "FIXED" | "PERCENTAGE";
  discountValue?: number;
  taxValue?: number;
  payment: {
    method: "CASH" | "QRIS" | "CARD" | "TRANSFER";
    amount: number;
  };
};

export type CreateSaleResult =
  | {
      success: true;
      saleId: string;
      invoiceNumber: string;
    }
  | {
      success: false;
      message: string;
    };

export type GetSaleProductsPaginatedInput = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type SaleCatalogItem = {
  id: string;
  name: string;
  variantName: string;
  sku: string;
  category: string;
  sellingPrice: number;
  stockQuantity: number;
};

export type PaginatedSaleProductsResult = {
  items: SaleCatalogItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

function errorResult(message: string): CreateSaleResult {
  return {
    success: false,
    message,
  };
}

function validateSaleInput(input: CreateSaleInput): string | null {
  if (!input.items?.length) {
    return "Keranjang masih kosong.";
  }

  for (const item of input.items) {
    if (!item.variantId) {
      return "Produk tidak valid.";
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return "Quantity harus lebih dari 0.";
    }
  }

  if (
    input.discountType &&
    !["FIXED", "PERCENTAGE"].includes(input.discountType)
  ) {
    return "Tipe diskon tidak valid.";
  }

  const discountValue = roundMoney(input.discountValue ?? 0);

  if (
    input.discountType &&
    (!Number.isFinite(discountValue) || discountValue < 0)
  ) {
    return "Diskon tidak valid.";
  }

  if (input.discountType === "PERCENTAGE" && discountValue > 100) {
    return "Diskon persen tidak boleh lebih dari 100.";
  }

  const taxValue = roundMoney(input.taxValue ?? 0);

  if (!Number.isFinite(taxValue) || taxValue < 0) {
    return "Pajak tidak valid.";
  }

  if (taxValue > 100) {
    return "Pajak persen tidak boleh lebih dari 100.";
  }

  if (
    !input.payment ||
    !Number.isFinite(input.payment.amount) ||
    input.payment.amount <= 0
  ) {
    return "Jumlah pembayaran tidak valid.";
  }

  return null;
}

function aggregateQuantities(
  items: CreateSaleItemInput[],
): Map<string, number> {
  const quantityMap = new Map<string, number>();

  for (const item of items) {
    quantityMap.set(
      item.variantId,
      (quantityMap.get(item.variantId) ?? 0) + item.quantity,
    );
  }

  return quantityMap;
}

function calculateDiscount(
  subtotal: number,
  discountType: CreateSaleInput["discountType"],
  discountValue: number,
): number {
  const rawDiscount =
    discountType === "PERCENTAGE"
      ? (subtotal * discountValue) / 100
      : discountType === "FIXED"
        ? discountValue
        : 0;

  return roundMoney(Math.min(Math.max(rawDiscount, 0), subtotal));
}

function calculateTax(taxableAmount: number, taxRate: number): number {
  return roundMoney((taxableAmount * taxRate) / 100);
}

// SALE PRODUCTS

export async function getSaleProductsPaginated(
  input: GetSaleProductsPaginatedInput = {},
): Promise<PaginatedSaleProductsResult> {
  try {
    const pageSize = Math.min(Math.max(input.pageSize ?? 24, 1), 100);

    const requestedPage = Math.max(input.page ?? 1, 1);
    const normalizedQuery = input.query?.trim() ?? "";
    const keyword = `%${normalizedQuery}%`;

    const whereCondition = normalizedQuery
      ? or(
          ilike(product.name, keyword),
          ilike(category.name, keyword),
          ilike(productVariant.name, keyword),
          ilike(productVariant.sku, keyword),
        )
      : undefined;

    const baseQuery = db
      .select({
        id: productVariant.id,
      })
      .from(productVariant)
      .innerJoin(product, eq(productVariant.productId, product.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(
        and(
          eq(product.isActive, true),
          eq(productVariant.isActive, true),
          whereCondition,
        ),
      );

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(baseQuery.as("sale_catalog_count"));

    const totalItems = Number(count ?? 0);

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const page = Math.min(requestedPage, totalPages);

    const offset = (page - 1) * pageSize;

    const rows = await db
      .select({
        id: productVariant.id,
        name: product.name,
        variantName: productVariant.name,
        sku: productVariant.sku,
        category: category.name,
        sellingPrice: productVariant.sellingPrice,
        stockQuantity: productVariant.stockQuantity,
      })
      .from(productVariant)
      .innerJoin(product, eq(productVariant.productId, product.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(
        and(
          eq(product.isActive, true),
          eq(productVariant.isActive, true),
          whereCondition,
        ),
      )
      .orderBy(desc(productVariant.createdAt))
      .limit(pageSize)
      .offset(offset);

    const items: SaleCatalogItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      variantName: row.variantName,
      sku: row.sku,
      category: row.category ?? "Uncategorized",
      sellingPrice: Number(row.sellingPrice),
      stockQuantity: Number(row.stockQuantity ?? 0),
    }));

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated sale products:", error);

    throw new Error("Failed to fetch paginated sale products");
  }
}

// CREATE SALE
export async function createSale(
  input: CreateSaleInput,
): Promise<CreateSaleResult> {
  try {
    const storeId = await getCurrentStoreId();

    // AUTH
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const cashierId = input.cashierId ?? session?.user?.id;

    if (!cashierId) {
      return errorResult("Cashier tidak valid. Silakan login kembali.");
    }

    // INPUT VALIDATION
    const validationError = validateSaleInput(input);

    if (validationError) {
      return errorResult(validationError);
    }

    const discountValue = roundMoney(input.discountValue ?? 0);

    const taxValue = roundMoney(input.taxValue ?? 0);

    const paymentAmount = roundMoney(input.payment.amount);

    // VERIFY CASHIER
    const [cashier] = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.id, cashierId))
      .limit(1);

    if (!cashier) {
      return errorResult("Cashier tidak ditemukan.");
    }

    // AGGREGATE ITEMS
    const quantityMap = aggregateQuantities(input.items);

    const variantIds = Array.from(quantityMap.keys());

    // DATABASE TRANSACTION
    const result = await db.transaction(async (tx) => {
      // LOAD VARIANTS

      const variants = await tx
        .select({
          id: productVariant.id,
          name: productVariant.name,
          sellingPrice: productVariant.sellingPrice,
          stockQuantity: productVariant.stockQuantity,
          isActive: productVariant.isActive,
        })
        .from(productVariant)
        .where(inArray(productVariant.id, variantIds));

      if (variants.length !== variantIds.length) {
        throw new Error("Salah satu produk tidak ditemukan.");
      }

      const variantMap = new Map(
        variants.map((variant) => [variant.id, variant]),
      );

      // BUILD SALE ITEMS
      const items = variantIds.map((variantId) => {
        const variant = variantMap.get(variantId);

        if (!variant) {
          throw new Error("Produk tidak ditemukan.");
        }

        if (!variant.isActive) {
          throw new Error(`Produk ${variant.name} tidak aktif.`);
        }

        const quantity = quantityMap.get(variantId) ?? 0;

        const unitPrice = Number(variant.sellingPrice);

        if (!Number.isFinite(unitPrice)) {
          throw new Error(`Harga ${variant.name} tidak valid.`);
        }

        if (variant.stockQuantity < quantity) {
          throw new Error(`Stok ${variant.name} tidak mencukupi.`);
        }

        const subtotal = roundMoney(unitPrice * quantity);

        return {
          variantId,
          quantity,
          unitPrice,
          discountAmount: 0,
          subtotal,
        };
      });

      // CALCULATE TOTAL
      const subtotal = roundMoney(
        items.reduce((sum, item) => sum + item.subtotal, 0),
      );

      const discountAmount = calculateDiscount(
        subtotal,
        input.discountType,
        discountValue,
      );

      const taxableAmount = Math.max(subtotal - discountAmount, 0);

      const taxAmount = calculateTax(taxableAmount, taxValue);

      const totalAmount = roundMoney(taxableAmount + taxAmount);

      if (totalAmount < 0) {
        throw new Error("Total transaksi tidak valid.");
      }

      if (paymentAmount < totalAmount) {
        throw new Error("Jumlah pembayaran kurang.");
      }

      // CREATE SALE
      const invoiceNumber = generateInvoiceNumber();

      const [createdSale] = await tx
        .insert(sale)
        .values({
          storeId,
          invoiceNumber,
          cashierId,

          subtotal: money(subtotal),

          discountType: input.discountType ?? null,

          discountValue: input.discountType ? money(discountValue) : null,

          discountAmount: money(discountAmount),

          taxRate: money(taxValue),

          taxAmount: money(taxAmount),

          totalAmount: money(totalAmount),

          status: "COMPLETED",
        })
        .returning({
          id: sale.id,
          invoiceNumber: sale.invoiceNumber,
        });

      if (!createdSale) {
        throw new Error("Gagal membuat transaksi.");
      }

      // CREATE SALE ITEMS
      await tx.insert(saleItem).values(
        items.map((item) => ({
          saleId: createdSale.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: money(item.unitPrice),
          discountAmount: money(item.discountAmount),
          subtotal: money(item.subtotal),
        })),
      );

      // UPDATE STOCK + INVENTORY TRANSACTION
      for (const item of items) {
        const updatedRows = await tx
          .update(productVariant)
          .set({
            stockQuantity: sql`${productVariant.stockQuantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(productVariant.id, item.variantId),
              gte(productVariant.stockQuantity, item.quantity),
            ),
          )
          .returning({
            id: productVariant.id,
          });

        if (updatedRows.length === 0) {
          const variant = variantMap.get(item.variantId);

          throw new Error(`Stok ${variant?.name ?? "produk"} tidak mencukupi.`);
        }

        await tx.insert(inventoryTransaction).values({
          variantId: item.variantId,
          type: "SALE",
          quantity: -item.quantity,
          referenceType: "SALE",
          referenceId: createdSale.id,
          createdBy: cashierId,
        });
      }

      // CREATE PAYMENT
      await tx.insert(payment).values({
        saleId: createdSale.id,
        method: input.payment.method,
        amount: money(paymentAmount),
      });

      return createdSale;
    });

    // CACHE REVALIDATION
    revalidatePath("/sale");
    revalidatePath("/sales");
    revalidatePath("/dashboard/products");

    return {
      success: true,
      saleId: result.id,
      invoiceNumber: result.invoiceNumber,
    };
  } catch (error) {
    console.error("Error creating sale:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal membuat transaksi.",
    };
  }
}
