import { relations, sql } from "drizzle-orm";
import {
  uuid,
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  check,
  unique,
} from "drizzle-orm/pg-core";

// ============================================================
// AUTH
// ============================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  emailVerified: boolean("email_verified")
    .default(false)
    .notNull(),

  image: text("image"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  role: text("role"),

  banned: boolean("banned").default(false),

  banReason: text("ban_reason"),

  banExpires: timestamp("ban_expires", {
    withTimezone: true,
  }),
});

export type InsertUser = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    token: text("token").notNull().unique(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .$onUpdate(() => new Date())
      .notNull(),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    impersonatedBy: text("impersonated_by"),
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

    accessTokenExpiresAt: timestamp(
      "access_token_expires_at",
      {
        withTimezone: true,
      },
    ),

    refreshTokenExpiresAt: timestamp(
      "refresh_token_expires_at",
      {
        withTimezone: true,
      },
    ),

    scope: text("scope"),

    password: text("password"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
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

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(
      table.identifier,
    ),
  ],
);

// ============================================================
// ENUMS
// ============================================================

export const saleStatusEnum = pgEnum("sale_status", [
  "COMPLETED",
  "VOIDED",
]);

export const paymentMethodEnum = pgEnum(
  "payment_method",
  [
    "CASH",
    "QRIS",
    "CARD",
    "TRANSFER",
  ],
);

export const inventoryTransactionTypeEnum =
  pgEnum("inventory_transaction_type", [
    "PURCHASE",
    "SALE",
    "SALE_RETURN",
    "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT",
  ]);

export const discountTypeEnum = pgEnum(
  "discount_type",
  [
    "PERCENTAGE",
    "FIXED",
  ],
);

// ============================================================
// STORE
// ============================================================

export const store = pgTable("store", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  name: varchar("name", {
    length: 150,
  }).notNull(),

  code: varchar("code", {
    length: 50,
  })
    .notNull()
    .unique(),

  address: text("address"),

  phone: varchar("phone", {
    length: 30,
  }),

  email: varchar("email", {
    length: 150,
  }),

  logoUrl: text("logo_url"),

  isActive: boolean("is_active")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type InsertStore = typeof store.$inferInsert;
export type SelectStore = typeof store.$inferSelect;

// ============================================================
// STORE SETTINGS
// ============================================================

export const storeSettings = pgTable(
  "store_settings",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // One settings record per store
    storeId: uuid("store_id")
      .notNull()
      .unique()
      .references(() => store.id, {
        onDelete: "cascade",
      }),

    receiptHeader: text("receipt_header"),

    receiptFooter: text("receipt_footer"),

    taxEnabled: boolean("tax_enabled")
      .notNull()
      .default(false),

    taxRate: numeric("tax_rate", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("0"),

    currency: varchar("currency", {
      length: 3,
    })
      .notNull()
      .default("IDR"),

    timezone: varchar("timezone", {
      length: 50,
    })
      .notNull()
      .default("Asia/Jakarta"),

    allowNegativeStock: boolean(
      "allow_negative_stock",
    )
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check(
      "storeSettings_taxRate_nonnegative",
      sql`${table.taxRate} >= 0`,
    ),

    check(
      "storeSettings_taxRate_max",
      sql`${table.taxRate} <= 100`,
    ),
  ],
);

export type InsertStoreSettings =
  typeof storeSettings.$inferInsert;

export type SelectStoreSettings =
  typeof storeSettings.$inferSelect;

// ============================================================
// CATEGORY
// ============================================================

export const category = pgTable(
  "category",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("category_storeId_name_unique").on(
      table.storeId,
      table.name,
    ),

    index("category_storeId_idx").on(
      table.storeId,
    ),
  ],
);

export type InsertCategory =
  typeof category.$inferInsert;

export type SelectCategory =
  typeof category.$inferSelect;

// ============================================================
// PRODUCT
// ============================================================

export const product = pgTable(
  "product",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id, {
        onDelete: "cascade",
      }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id),

    name: text("name").notNull(),

    description: text("description"),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_storeId_idx").on(
      table.storeId,
    ),

    index("product_categoryId_idx").on(
      table.categoryId,
    ),
  ],
);

export type InsertProduct =
  typeof product.$inferInsert;

export type SelectProduct =
  typeof product.$inferSelect;

// ============================================================
// PRODUCT VARIANT
// ============================================================

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

    // SKU remains globally unique for MVP.
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

    /**
     * Current stock balance.
     *
     * Negative values are allowed when
     * storeSettings.allowNegativeStock = true.
     */
    stockQuantity: integer("stock_quantity")
      .notNull()
      .default(0),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("productVariant_productId_idx").on(
      table.productId,
    ),

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

export type InsertProductVariant =
  typeof productVariant.$inferInsert;

export type SelectProductVariant =
  typeof productVariant.$inferSelect;

// ============================================================
// INVENTORY
// ============================================================

export const inventoryTransaction = pgTable(
  "inventory_transaction",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id),

    type: inventoryTransactionTypeEnum(
      "type",
    ).notNull(),

    /**
     * Signed quantity:
     *
     * PURCHASE       +10
     * SALE            -2
     * SALE_RETURN     +2
     * ADJUSTMENT_IN   +5
     * ADJUSTMENT_OUT  -5
     */
    quantity: integer("quantity").notNull(),

    referenceType: text("reference_type"),

    referenceId: text("reference_id"),

    reason: text("reason"),

    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index(
      "inventoryTransaction_variantId_idx",
    ).on(table.variantId),

    index(
      "inventoryTransaction_reference_idx",
    ).on(
      table.referenceType,
      table.referenceId,
    ),

    check(
      "inventoryTransaction_quantity_nonzero",
      sql`${table.quantity} <> 0`,
    ),
  ],
);

export type InsertInventoryTransaction =
  typeof inventoryTransaction.$inferInsert;

export type SelectInventoryTransaction =
  typeof inventoryTransaction.$inferSelect;

// ============================================================
// SALE
// ============================================================

export const sale = pgTable(
  "sale",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    storeId: uuid("store_id")
      .notNull()
      .references(() => store.id),

    invoiceNumber: text("invoice_number")
      .notNull()
      .unique(),

    cashierId: text("cashier_id")
      .notNull()
      .references(() => user.id),

    subtotal: numeric("subtotal", {
      precision: 15,
      scale: 2,
    }).notNull(),

    discountType: discountTypeEnum(
      "discount_type",
    ),

    discountValue: numeric(
      "discount_value",
      {
        precision: 15,
        scale: 2,
      },
    ),

    discountAmount: numeric(
      "discount_amount",
      {
        precision: 15,
        scale: 2,
      },
    )
      .default("0")
      .notNull(),

    /**
     * Tax rate snapshot at time of sale.
     */
    taxRate: numeric("tax_rate", {
      precision: 5,
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

    soldAt: timestamp("sold_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    // VOID audit fields
    voidedAt: timestamp("voided_at", {
      withTimezone: true,
    }),

    voidedBy: text("voided_by").references(
      () => user.id,
    ),

    voidReason: text("void_reason"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sale_storeId_idx").on(
      table.storeId,
    ),

    index("sale_cashierId_idx").on(
      table.cashierId,
    ),

    index("sale_soldAt_idx").on(
      table.soldAt,
    ),

    check(
      "sale_subtotal_nonnegative",
      sql`${table.subtotal} >= 0`,
    ),

    check(
      "sale_discountValue_nonnegative",
      sql`
        ${table.discountValue} IS NULL
        OR ${table.discountValue} >= 0
      `,
    ),

    check(
      "sale_discountAmount_nonnegative",
      sql`${table.discountAmount} >= 0`,
    ),

    check(
      "sale_taxRate_valid",
      sql`
        ${table.taxRate} >= 0
        AND ${table.taxRate} <= 100
      `,
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

export type InsertSales = typeof sale.$inferInsert;
export type SelectSales = typeof sale.$inferSelect;

// ============================================================
// SALE ITEM
// ============================================================

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

    discountAmount: numeric(
      "discount_amount",
      {
        precision: 15,
        scale: 2,
      },
    )
      .default("0")
      .notNull(),

    subtotal: numeric("subtotal", {
      precision: 15,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    unique("saleItem_saleId_variantId_unique").on(
      table.saleId,
      table.variantId,
    ),

    index("saleItem_saleId_idx").on(
      table.saleId,
    ),

    index("saleItem_variantId_idx").on(
      table.variantId,
    ),

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

export type InsertSaleItem =
  typeof saleItem.$inferInsert;

export type SelectSaleItem =
  typeof saleItem.$inferSelect;

// ============================================================
// PAYMENT
// ============================================================

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

    method: paymentMethodEnum(
      "method",
    ).notNull(),

    amount: numeric("amount", {
      precision: 15,
      scale: 2,
    }).notNull(),

    paidAt: timestamp("paid_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("payment_saleId_idx").on(
      table.saleId,
    ),

    check(
      "payment_amount_positive",
      sql`${table.amount} > 0`,
    ),
  ],
);

export type InsertPayment =
  typeof payment.$inferInsert;

export type SelectPayment =
  typeof payment.$inferSelect;

// ============================================================
// RELATIONS
// ============================================================

export const userRelations = relations(
  user,
  ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    sales: many(sale),
    inventoryTransactions: many(
      inventoryTransaction,
    ),
  }),
);

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

export const storeRelations = relations(
  store,
  ({ one, many }) => ({
    settings: one(storeSettings),

    categories: many(category),

    products: many(product),

    sales: many(sale),
  }),
);

export const storeSettingsRelations =
  relations(
    storeSettings,
    ({ one }) => ({
      store: one(store, {
        fields: [storeSettings.storeId],
        references: [store.id],
      }),
    }),
  );

export const categoryRelations = relations(
  category,
  ({ one, many }) => ({
    store: one(store, {
      fields: [category.storeId],
      references: [store.id],
    }),

    products: many(product),
  }),
);

export const productRelations = relations(
  product,
  ({ one, many }) => ({
    store: one(store, {
      fields: [product.storeId],
      references: [store.id],
    }),

    category: one(category, {
      fields: [product.categoryId],
      references: [category.id],
    }),

    variants: many(productVariant),
  }),
);

export const productVariantRelations =
  relations(
    productVariant,
    ({ one, many }) => ({
      product: one(product, {
        fields: [productVariant.productId],
        references: [product.id],
      }),

      inventoryTransactions: many(
        inventoryTransaction,
      ),

      saleItems: many(saleItem),
    }),
  );

export const inventoryTransactionRelations =
  relations(
    inventoryTransaction,
    ({ one }) => ({
      variant: one(productVariant, {
        fields: [
          inventoryTransaction.variantId,
        ],
        references: [productVariant.id],
      }),

      createdByUser: one(user, {
        fields: [
          inventoryTransaction.createdBy,
        ],
        references: [user.id],
      }),
    }),
  );

export const saleRelations = relations(
  sale,
  ({ one, many }) => ({
    store: one(store, {
      fields: [sale.storeId],
      references: [store.id],
    }),

    cashier: one(user, {
      fields: [sale.cashierId],
      references: [user.id],
    }),

    voidedByUser: one(user, {
      fields: [sale.voidedBy],
      references: [user.id],
      relationName: "saleVoidedBy",
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

// ============================================================
// SCHEMA
// ============================================================

export const schema = {
  // Auth
  user,
  session,
  account,
  verification,

  // Store
  store,
  storeSettings,

  // Product
  category,
  product,
  productVariant,

  // Inventory
  inventoryTransaction,

  // POS
  sale,
  saleItem,
  payment,
};