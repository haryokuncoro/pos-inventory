"use server";

import { db } from "@/db/drizzle";
import {
  sale,
  saleItem,
  product,
  productVariant,
  category,
  user,
} from "@/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getCurrentStoreId } from "./store";

export type SalesTodaySummary = {
  salesCount: number;
  totalRevenue: number;
};

export type SalesByProductRow = {
  productName: string;
  categoryName: string | null;
  quantity: number;
  totalRevenue: number;
};

export type SalesByCategoryRow = {
  categoryName: string;
  quantity: number;
  totalRevenue: number;
};

export type SalesReportSummary = {
  today: SalesTodaySummary;
  salesByProduct: SalesByProductRow[];
  salesByCategory: SalesByCategoryRow[];
  bestSellingProducts: SalesByProductRow[];
};

export async function getAllSales() {
  try {
    const storeId = await getCurrentStoreId();
    const sales = await db
      .select({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,

        cashierId: sale.cashierId,

        cashierName: user.name,

        subtotal: sale.subtotal,

        discountAmount: sale.discountAmount,

        taxAmount: sale.taxAmount,

        totalAmount: sale.totalAmount,

        status: sale.status,

        soldAt: sale.soldAt,

        createdAt: sale.createdAt,
      })
      .from(sale)
      .innerJoin(user, eq(sale.cashierId, user.id))
      .where(eq(sale.storeId, storeId))
      .orderBy(desc(sale.soldAt));

    return sales;
  } catch (error) {
    console.error("Error fetching sales:", error);

    throw new Error("Failed to fetch sales");
  }
}

export async function getSalesReportSummary(): Promise<SalesReportSummary> {
  try {
    const storeId = await getCurrentStoreId();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todaySummaryRows, productRows, categoryRows] = await Promise.all([
      db
        .select({
          salesCount: sql<number>`count(*)::int`,
          totalRevenue: sql<number>`coalesce(sum(${sale.totalAmount})::float8, 0)`,
        })
        .from(sale)
        .where(
          and(
            eq(sale.storeId, storeId),
            eq(sale.status, "COMPLETED"),
            gte(sale.soldAt, todayStart),
          ),
        ),
      db
        .select({
          productName: product.name,
          categoryName: category.name,
          quantity: sql<number>`cast(sum(${saleItem.quantity}) as integer)`,
          totalRevenue: sql<number>`coalesce(sum(${saleItem.subtotal})::float8, 0)`,
        })
        .from(saleItem)
        .innerJoin(productVariant, eq(saleItem.variantId, productVariant.id))
        .innerJoin(product, eq(productVariant.productId, product.id))
        .leftJoin(category, eq(product.categoryId, category.id))
        .innerJoin(sale, eq(saleItem.saleId, sale.id))
        .where(and(eq(sale.storeId, storeId), eq(sale.status, "COMPLETED")))
        .groupBy(product.id, category.id, product.name, category.name)
        .orderBy(
          desc(sql<number>`cast(sum(${saleItem.quantity}) as integer)`),
          desc(sql<number>`coalesce(sum(${saleItem.subtotal})::float8, 0)`),
        ),
      db
        .select({
          categoryName: category.name,
          quantity: sql<number>`cast(sum(${saleItem.quantity}) as integer)`,
          totalRevenue: sql<number>`coalesce(sum(${saleItem.subtotal})::float8, 0)`,
        })
        .from(saleItem)
        .innerJoin(productVariant, eq(saleItem.variantId, productVariant.id))
        .innerJoin(product, eq(productVariant.productId, product.id))
        .leftJoin(category, eq(product.categoryId, category.id))
        .innerJoin(sale, eq(saleItem.saleId, sale.id))
        .where(and(eq(sale.storeId, storeId), eq(sale.status, "COMPLETED")))
        .groupBy(category.id, category.name)
        .orderBy(
          desc(sql<number>`cast(sum(${saleItem.quantity}) as integer)`),
          desc(sql<number>`coalesce(sum(${saleItem.subtotal})::float8, 0)`),
        ),
    ]);

    const today = {
      salesCount: Number(todaySummaryRows[0]?.salesCount ?? 0),
      totalRevenue: Number(todaySummaryRows[0]?.totalRevenue ?? 0),
    };

    const salesByProduct: SalesByProductRow[] = productRows.map((row) => ({
      productName: row.productName,
      categoryName: row.categoryName,
      quantity: Number(row.quantity ?? 0),
      totalRevenue: Number(row.totalRevenue ?? 0),
    }));

    const salesByCategory: SalesByCategoryRow[] = categoryRows.map((row) => ({
      categoryName: row.categoryName ?? "Uncategorized",
      quantity: Number(row.quantity ?? 0),
      totalRevenue: Number(row.totalRevenue ?? 0),
    }));

    return {
      today,
      salesByProduct,
      salesByCategory,
      bestSellingProducts: salesByProduct.slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching sales report summary:", error);

    throw new Error("Failed to fetch sales report summary");
  }
}
