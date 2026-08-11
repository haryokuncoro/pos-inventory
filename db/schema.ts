import { relations, sql } from "drizzle-orm";
import {
  uuid,
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  unique,
  check,
} from "drizzle-orm/pg-core";

 // AUTH

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    expiresAt: timestamp("expires_at").notNull(),

    token: text("token").notNull().unique(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
  ],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),

    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),

    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),

    scope: text("scope"),
    password: text("password"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),

    identifier: text("identifier").notNull(),
    value: text("value").notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
  ],
);

// ENUMS

export const saleStatusEnum = pgEnum("sale_status", [
  "COMPLETED",
  "VOIDED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "QRIS",
  "CARD",
  "TRANSFER",
]);

export const inventoryTransactionTypeEnum = pgEnum(
  "inventory_transaction_type",
  [
    "PURCHASE",
    "SALE",
    "SALE_RETURN",
    "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT",
  ],
);

// PRODUCT

export const category = pgTable("category", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

  name: text("name")
    .notNull()
    .unique(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type InsertCategory = typeof category.$inferInsert;
export type SelectCategory = typeof category.$inferSelect;

export const product = pgTable(
  "product",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id),

    name: text("name").notNull(),

    description: text("description"),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_categoryId_idx").on(table.categoryId),
  ],
);

export const productVariant = pgTable(
  "product_variant",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
      }),

    sku: text("sku")
      .notNull()
      .unique(),

    name: text("name").notNull(),

    costPrice: numeric("cost_price", {
      precision: 15,
      scale: 2,
    }).notNull(),

    sellingPrice: numeric("selling_price", {
      precision: 15,
      scale: 2,
    }).notNull(),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("productVariant_productId_idx").on(table.productId),

    check(
      "productVariant_costPrice_nonnegative",
      sql`${table.costPrice} >= 0`,
    ),

    check(
      "productVariant_sellingPrice_nonnegative",
      sql`${table.sellingPrice} >= 0`,
    ),
  ],
);

// WAREHOUSE / STORE

export const warehouse = pgTable("warehouse", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

  code: text("code")
    .notNull()
    .unique(),

  name: text("name").notNull(),

  address: text("address"),

  isActive: boolean("is_active")
    .default(true)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// INVENTORY

export const inventoryStock = pgTable(
  "inventory_stock",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouse.id),

    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id),

    quantity: integer("quantity")
      .notNull()
      .default(0),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("inventoryStock_warehouse_variant_unique").on(
      table.warehouseId,
      table.variantId,
    ),

    index("inventoryStock_warehouseId_idx").on(table.warehouseId),

    index("inventoryStock_variantId_idx").on(table.variantId),

    check(
      "inventoryStock_quantity_nonnegative",
      sql`${table.quantity} >= 0`,
    ),
  ],
);

export const inventoryTransaction = pgTable(
  "inventory_transaction",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouse.id),

    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id),

    type: inventoryTransactionTypeEnum("type")
      .notNull(),

    quantity: integer("quantity")
      .notNull(),

    referenceType: text("reference_type"),
    referenceId: text("reference_id"),

    reason: text("reason"),

    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inventoryTransaction_variantId_idx").on(
      table.variantId,
    ),

    index("inventoryTransaction_warehouseId_idx").on(
      table.warehouseId,
    ),

    index("inventoryTransaction_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),

    check(
      "inventoryTransaction_quantity_nonzero",
      sql`${table.quantity} <> 0`,
    ),
  ],
);

// POS / SALES

export const sale = pgTable(
  "sale",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    invoiceNumber: text("invoice_number")
      .notNull()
      .unique(),

    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouse.id),

    cashierId: text("cashier_id")
      .notNull()
      .references(() => user.id),

    subtotal: numeric("subtotal", {
      precision: 15,
      scale: 2,
    }).notNull(),

    discountAmount: numeric("discount_amount", {
      precision: 15,
      scale: 2,
    })
      .default("0")
      .notNull(),

    taxAmount: numeric("tax_amount", {
      precision: 15,
      scale: 2,
    })
      .default("0")
      .notNull(),

    totalAmount: numeric("total_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),

    status: saleStatusEnum("status")
      .default("COMPLETED")
      .notNull(),

    soldAt: timestamp("sold_at")
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sale_warehouseId_idx").on(table.warehouseId),

    index("sale_cashierId_idx").on(table.cashierId),

    index("sale_soldAt_idx").on(table.soldAt),

    check(
      "sale_subtotal_nonnegative",
      sql`${table.subtotal} >= 0`,
    ),

    check(
      "sale_discountAmount_nonnegative",
      sql`${table.discountAmount} >= 0`,
    ),

    check(
      "sale_taxAmount_nonnegative",
      sql`${table.taxAmount} >= 0`,
    ),

    check(
      "sale_totalAmount_nonnegative",
      sql`${table.totalAmount} >= 0`,
    ),
  ],
);

export const saleItem = pgTable(
  "sale_item",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    saleId: uuid("sale_id")
      .notNull()
      .references(() => sale.id, {
        onDelete: "cascade",
      }),

    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id),

    quantity: integer("quantity")
      .notNull(),

    unitPrice: numeric("unit_price", {
      precision: 15,
      scale: 2,
    }).notNull(),

    discountAmount: numeric("discount_amount", {
      precision: 15,
      scale: 2,
    })
      .default("0")
      .notNull(),

    subtotal: numeric("subtotal", {
      precision: 15,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    index("saleItem_saleId_idx").on(table.saleId),

    index("saleItem_variantId_idx").on(table.variantId),

    check(
      "saleItem_quantity_positive",
      sql`${table.quantity} > 0`,
    ),

    check(
      "saleItem_unitPrice_nonnegative",
      sql`${table.unitPrice} >= 0`,
    ),

    check(
      "saleItem_discountAmount_nonnegative",
      sql`${table.discountAmount} >= 0`,
    ),

    check(
      "saleItem_subtotal_nonnegative",
      sql`${table.subtotal} >= 0`,
    ),
  ],
);

// PAYMENT

export const payment = pgTable(
  "payment",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    saleId: uuid("sale_id")
      .notNull()
      .references(() => sale.id, {
        onDelete: "cascade",
      }),

    method: paymentMethodEnum("method")
      .notNull(),

    amount: numeric("amount", {
      precision: 15,
      scale: 2,
    }).notNull(),

    paidAt: timestamp("paid_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("payment_saleId_idx").on(table.saleId),

    check(
      "payment_amount_positive",
      sql`${table.amount} > 0`,
    ),
  ],
);

//RELATIONS

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),

  sales: many(sale),

  inventoryTransactions: many(inventoryTransaction),
}));

export const sessionRelations = relations(
  session,
  ({ one }) => ({
    user: one(user, {
      fields: [session.userId],
      references: [user.id],
    }),
  }),
);

export const accountRelations = relations(
  account,
  ({ one }) => ({
    user: one(user, {
      fields: [account.userId],
      references: [user.id],
    }),
  }),
);

export const categoryRelations = relations(
  category,
  ({ many }) => ({
    products: many(product),
  }),
);

export const productRelations = relations(
  product,
  ({ one, many }) => ({
    category: one(category, {
      fields: [product.categoryId],
      references: [category.id],
    }),

    variants: many(productVariant),
  }),
);

export const productVariantRelations = relations(
  productVariant,
  ({ one, many }) => ({
    product: one(product, {
      fields: [productVariant.productId],
      references: [product.id],
    }),

    inventoryStocks: many(inventoryStock),

    inventoryTransactions: many(inventoryTransaction),

    saleItems: many(saleItem),
  }),
);

export const warehouseRelations = relations(
  warehouse,
  ({ many }) => ({
    inventoryStocks: many(inventoryStock),

    inventoryTransactions: many(inventoryTransaction),

    sales: many(sale),
  }),
);

export const inventoryStockRelations = relations(
  inventoryStock,
  ({ one }) => ({
    warehouse: one(warehouse, {
      fields: [inventoryStock.warehouseId],
      references: [warehouse.id],
    }),

    variant: one(productVariant, {
      fields: [inventoryStock.variantId],
      references: [productVariant.id],
    }),
  }),
);

export const inventoryTransactionRelations = relations(
  inventoryTransaction,
  ({ one }) => ({
    warehouse: one(warehouse, {
      fields: [inventoryTransaction.warehouseId],
      references: [warehouse.id],
    }),

    variant: one(productVariant, {
      fields: [inventoryTransaction.variantId],
      references: [productVariant.id],
    }),

    createdByUser: one(user, {
      fields: [inventoryTransaction.createdBy],
      references: [user.id],
    }),
  }),
);

export const saleRelations = relations(
  sale,
  ({ one, many }) => ({
    warehouse: one(warehouse, {
      fields: [sale.warehouseId],
      references: [warehouse.id],
    }),

    cashier: one(user, {
      fields: [sale.cashierId],
      references: [user.id],
    }),

    items: many(saleItem),

    payments: many(payment),
  }),
);

export const saleItemRelations = relations(
  saleItem,
  ({ one }) => ({
    sale: one(sale, {
      fields: [saleItem.saleId],
      references: [sale.id],
    }),

    variant: one(productVariant, {
      fields: [saleItem.variantId],
      references: [productVariant.id],
    }),
  }),
);

export const paymentRelations = relations(
  payment,
  ({ one }) => ({
    sale: one(sale, {
      fields: [payment.saleId],
      references: [sale.id],
    }),
  }),
);

// SCHEMA

export const schema = {
  // Auth
  user,
  session,
  account,
  verification,

  // Product
  category,
  product,
  productVariant,

  // Store
  warehouse,

  // Inventory
  inventoryStock,
  inventoryTransaction,

  // POS
  sale,
  saleItem,
  payment,
};
