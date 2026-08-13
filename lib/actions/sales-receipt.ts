import { db } from "@/db/drizzle";
import {
  sale,
  saleItem,
  product,
  productVariant,
  category,
  user,
  payment,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSaleById(id: string) {
  try {
    const [saleData] = await db
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
      .where(eq(sale.id, id))
      .limit(1);

    if (!saleData) {
      return null;
    }

    const items = await db
      .select({
        id: saleItem.id,
        saleId: saleItem.saleId,
        variantId: saleItem.variantId,
        quantity: saleItem.quantity,
        unitPrice: saleItem.unitPrice,
        discountAmount: saleItem.discountAmount,
        subtotal: saleItem.subtotal,

        sku: productVariant.sku,
        variantName: productVariant.name,

        productId: product.id,
        productName: product.name,

        categoryId: category.id,
        categoryName: category.name,
      })
      .from(saleItem)
      .innerJoin(productVariant, eq(saleItem.variantId, productVariant.id))
      .innerJoin(product, eq(productVariant.productId, product.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(eq(saleItem.saleId, id));

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
    console.error(`Error fetching sale ${id}:`, error);

    throw new Error(`Failed to fetch sale ${id}`);
  }
}

