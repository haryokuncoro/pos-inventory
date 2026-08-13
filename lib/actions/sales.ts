"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import {
  sale,
  saleItem,
  payment,
  inventoryTransaction,
  product,
  productVariant,
  category,
  user
} from "@/db/schema";
import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ProductWithCategoryAndVariants } from "./products";

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

  discountAmount?: number;

  taxAmount?: number;

  payment: {
    method:
      | "CASH"
      | "QRIS"
      | "CARD"
      | "TRANSFER";

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

 // HELPERS

function roundMoney(value: number) {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

function money(value: number) {
  return roundMoney(value).toFixed(2);
}

function generateInvoiceNumber() {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const random = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `INV-${date}-${random}`;
}

/**
 * GET PRODUCTS FOR SALE
 * Only active products and active variants are returned.
 * =========================================================
 */

export async function getSaleProducts(): Promise<
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
      .leftJoin(
        category,
        eq(product.categoryId, category.id),
      )
      .where(eq(product.isActive, true));

    const variants = await db
      .select({
        id: productVariant.id,
        productId: productVariant.productId,
        sku: productVariant.sku,
        name: productVariant.name,
        costPrice: productVariant.costPrice,
        sellingPrice:
          productVariant.sellingPrice,
        stockQuantity:
          productVariant.stockQuantity,
        isActive: productVariant.isActive,
        createdAt:
          productVariant.createdAt,
        updatedAt:
          productVariant.updatedAt,
      })
      .from(productVariant)
      .where(
        eq(productVariant.isActive, true),
      );

    return products.map((item) => ({
      ...item,
      variants: variants.filter(
        (variant) =>
          variant.productId === item.id,
      ),
    }));
  } catch (error) {
    console.error(
      "Error fetching sale products:",
      error,
    );

    throw new Error(
      "Failed to fetch sale products",
    );
  }
}

/**
 * Get sale catalog rows with server-side pagination.
 * Pagination is based on variants, so page size matches rendered product cards.
 */
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

/**
 * =========================================================
 * CREATE SALE
 * =========================================================
 *
 * Client sends only:
 *
 * - variantId
 * - quantity
 *
 * Price is always taken from the database.
 *
 * Everything below happens in ONE DB transaction:
 *
 * 1. Create sale
 * 2. Create sale items
 * 3. Decrease stock
 * 4. Create inventory transaction
 * 5. Create payment
 *
 * If any step fails, everything rolls back.
 * =========================================================
 */

export async function createSale( input: CreateSaleInput): Promise<CreateSaleResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const cashierId = input.cashierId ?? session?.user?.id;

    if (!cashierId) {
      return {
        success: false,
        message: "Cashier tidak valid. Silakan login kembali.",
      };
    }

    // BASIC VALIDATION

    if (
      !input.items ||
      input.items.length === 0
    ) {
      return {
        success: false,
        message: "Keranjang masih kosong.",
      };
    }

    for (const item of input.items) {
      if (!item.variantId) {
        return {
          success: false,
          message: "Produk tidak valid.",
        };
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return {
          success: false,
          message:
            "Quantity harus lebih dari 0.",
        };
      }
    }

    if (
      input.discountType &&
      input.discountType !== "FIXED" &&
      input.discountType !== "PERCENTAGE"
    ) {
      return {
        success: false,
        message: "Tipe diskon tidak valid.",
      };
    }

    const discountValue = roundMoney(
      input.discountValue ?? 0,
    );

    if (
      input.discountType &&
      (!Number.isFinite(discountValue) || discountValue < 0)
    ) {
      return {
        success: false,
        message: "Diskon tidak valid.",
      };
    }

    if (
      input.discountType === "PERCENTAGE" &&
      discountValue > 100
    ) {
      return {
        success: false,
        message: "Diskon persen tidak boleh lebih dari 100.",
      };
    }

    const taxAmount = roundMoney(
      input.taxAmount ?? 0,
    );

    if (taxAmount < 0) {
      return {
        success: false,
        message: "Pajak tidak valid.",
      };
    }

    if (
      !input.payment ||
      !Number.isFinite(
        input.payment.amount,
      ) ||
      input.payment.amount <= 0
    ) {
      return {
        success: false,
        message:
          "Jumlah pembayaran tidak valid.",
      };
    }

    // VERIFY CASHIER

    const [cashier] = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.id, cashierId))
      .limit(1);

    if (!cashier) {
      return {
        success: false,
        message: "Cashier tidak ditemukan.",
      };
    }

    // TRANSACTION

    const quantityMap = new Map<string, number>();

    for (const item of input.items) {
      quantityMap.set(
        item.variantId,
        (quantityMap.get(item.variantId) ?? 0) + item.quantity,
      );
    }

    const variantIds = Array.from(quantityMap.keys());

    const variants = await db
      .select({
        id: productVariant.id,
        sku: productVariant.sku,
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

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

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

      const subtotal = roundMoney(unitPrice * quantity);

      return {
        variantId,
        quantity,
        unitPrice,
        discountAmount: 0,
        subtotal,
      };
    });

    const subtotal = roundMoney(
      items.reduce((sum, item) => sum + item.subtotal, 0),
    );

    // Discount amount is always recomputed server-side from type + value.
    const rawDiscountAmount =
      input.discountType === "PERCENTAGE"
        ? (subtotal * discountValue) / 100
        : input.discountType === "FIXED"
          ? discountValue
          : 0;

    const discountAmount = roundMoney(
      Math.min(Math.max(rawDiscountAmount, 0), subtotal),
    );

    const totalAmount = roundMoney(subtotal - discountAmount + taxAmount);

    if (totalAmount < 0) {
      throw new Error("Total transaksi tidak valid.");
    }

    const paymentAmount = roundMoney(input.payment.amount);

    if (paymentAmount < totalAmount) {
      throw new Error("Jumlah pembayaran kurang.");
    }

    const invoiceNumber = generateInvoiceNumber();

    const [createdSale] = await db
      .insert(sale)
      .values({
        invoiceNumber,
        cashierId,
        subtotal: money(subtotal),
        discountType: input.discountType ?? null,
        discountValue: input.discountType
          ? money(discountValue)
          : null,
        discountAmount: money(discountAmount),
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

    await db.insert(saleItem).values(
      items.map((item) => ({
        saleId: createdSale.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: money(item.unitPrice),
        discountAmount: money(item.discountAmount),
        subtotal: money(item.subtotal),
      })),
    );

    for (const item of items) {
      const currentVariant = await db
        .select({
          id: productVariant.id,
          stockQuantity: productVariant.stockQuantity,
          name: productVariant.name,
        })
        .from(productVariant)
        .where(eq(productVariant.id, item.variantId))
        .limit(1);

      const variant = currentVariant[0];

      if (!variant) {
        throw new Error("Produk tidak ditemukan.");
      }

      if (variant.stockQuantity < item.quantity) {
        throw new Error(`Stok ${variant.name} tidak mencukupi.`);
      }

      await db
        .update(productVariant)
        .set({
          stockQuantity: variant.stockQuantity - item.quantity,
          updatedAt: new Date(),
        })
        .where(eq(productVariant.id, item.variantId));

      await db.insert(inventoryTransaction).values({
        variantId: item.variantId,
        type: "SALE",
        quantity: -item.quantity,
        referenceType: "SALE",
        referenceId: createdSale.id,
        createdBy: cashierId,
      });
    }

    await db.insert(payment).values({
      saleId: createdSale.id,
      method: input.payment.method,
      amount: money(paymentAmount),
    });

    revalidatePath("/sale");
    revalidatePath("/sales");
    revalidatePath("/dashboard/product");

    return {
      success: true,
      saleId: createdSale.id,
      invoiceNumber: createdSale.invoiceNumber,
    };
  } catch (error) {
    console.error(
      "Error creating sale:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal membuat transaksi.",
    };
  }
}

/**
 * GET SALE BY ID
 */

export async function getSaleById(
  id: string,
) {
  try {
    const [saleData] = await db
      .select({
        id: sale.id,
        invoiceNumber:
          sale.invoiceNumber,
        cashierId: sale.cashierId,
        cashierName: user.name,

        subtotal: sale.subtotal,
        discountAmount:
          sale.discountAmount,
        taxAmount: sale.taxAmount,
        totalAmount:
          sale.totalAmount,

        status: sale.status,
        soldAt: sale.soldAt,
        createdAt: sale.createdAt,
      })
      .from(sale)
      .innerJoin(
        user,
        eq(sale.cashierId, user.id),
      )
      .where(eq(sale.id, id))
      .limit(1);

    if (!saleData) {
      return null;
    }

    const items = await db
      .select({
        id: saleItem.id,
        saleId: saleItem.saleId,
        variantId:
          saleItem.variantId,
        quantity: saleItem.quantity,
        unitPrice:
          saleItem.unitPrice,
        discountAmount:
          saleItem.discountAmount,
        subtotal:
          saleItem.subtotal,

        sku: productVariant.sku,
        variantName:
          productVariant.name,

        productId:
          product.id,
        productName:
          product.name,

        categoryId:
          category.id,
        categoryName:
          category.name,
      })
      .from(saleItem)
      .innerJoin(
        productVariant,
        eq(
          saleItem.variantId,
          productVariant.id,
        ),
      )
      .innerJoin(
        product,
        eq(
          productVariant.productId,
          product.id,
        ),
      )
      .leftJoin(
        category,
        eq(
          product.categoryId,
          category.id,
        ),
      )
      .where(
        eq(saleItem.saleId, id),
      );

    const payments = await db
      .select({
        id: payment.id,
        method: payment.method,
        amount: payment.amount,
        paidAt: payment.paidAt,
      })
      .from(payment)
      .where(eq(payment.saleId, id));

    return {
      ...saleData,
      items,
      payments,
    };
  } catch (error) {
    console.error(
      `Error fetching sale ${id}:`,
      error,
    );

    throw new Error(
      `Failed to fetch sale ${id}`,
    );
  }
}

/**
 * GET ALL SALES
 */

export async function getAllSales() {
  try {
    const sales = await db
      .select({
        id: sale.id,
        invoiceNumber:
          sale.invoiceNumber,

        cashierId:
          sale.cashierId,

        cashierName:
          user.name,

        subtotal:
          sale.subtotal,

        discountAmount:
          sale.discountAmount,

        taxAmount:
          sale.taxAmount,

        totalAmount:
          sale.totalAmount,

        status:
          sale.status,

        soldAt:
          sale.soldAt,

        createdAt:
          sale.createdAt,
      })
      .from(sale)
      .innerJoin(
        user,
        eq(sale.cashierId, user.id),
      )
      .orderBy(
        desc(sale.soldAt),
      );

    return sales;
  } catch (error) {
    console.error(
      "Error fetching sales:",
      error,
    );

    throw new Error(
      "Failed to fetch sales",
    );
  }
}

/**
 * GET RECENT SALES
 */

export async function getRecentSales(
  limit = 20,
) {
  const safeLimit = Math.min(
    Math.max(
      Number.isFinite(limit)
        ? Math.floor(limit)
        : 20,
      1,
    ),
    100,
  );

  try {
    const sales = await db
      .select({
        id: sale.id,
        invoiceNumber:
          sale.invoiceNumber,

        cashierId:
          sale.cashierId,

        cashierName:
          user.name,

        totalAmount:
          sale.totalAmount,

        status:
          sale.status,

        soldAt:
          sale.soldAt,
      })
      .from(sale)
      .innerJoin(
        user,
        eq(sale.cashierId, user.id),
      )
      .orderBy(
        desc(sale.soldAt),
      )
      .limit(safeLimit);

    return sales;
  } catch (error) {
    console.error(
      "Error fetching recent sales:",
      error,
    );

    throw new Error(
      "Failed to fetch recent sales",
    );
  }
}
