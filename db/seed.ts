import { db } from "@/db/drizzle";
import {
  user,
  category,
  product,
  productVariant,
  warehouse,
  inventoryStock,
} from "@/db/schema";

import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * =========================================================
 * MASTER DATA
 * =========================================================
 */

const CATEGORIES = [
  "Beverages",
  "Food",
  "Snacks",
  "Personal Care",
  "Household",
];

const WAREHOUSES = [
  {
    code: "WH-001",
    name: "Main Warehouse",
    address: "Jakarta",
  },
  {
    code: "WH-002",
    name: "Secondary Warehouse",
    address: "Bandung",
  },
];

const PRODUCTS = [
  {
    name: "Coca Cola",
    description: "Carbonated soft drink",
    category: "Beverages",
    variants: [
      {
        sku: "CC-330",
        name: "330ml",
        costPrice: 5000,
        sellingPrice: 7000,
      },
      {
        sku: "CC-1000",
        name: "1 Liter",
        costPrice: 9000,
        sellingPrice: 12000,
      },
    ],
  },

  {
    name: "Indomie Goreng",
    description: "Instant fried noodle",
    category: "Food",
    variants: [
      {
        sku: "IND-GOR-001",
        name: "Original",
        costPrice: 2500,
        sellingPrice: 3500,
      },
    ],
  },

  {
    name: "Chitato",
    description: "Potato chips",
    category: "Snacks",
    variants: [
      {
        sku: "CHT-68",
        name: "68g",
        costPrice: 8000,
        sellingPrice: 11000,
      },
      {
        sku: "CHT-120",
        name: "120g",
        costPrice: 13000,
        sellingPrice: 17000,
      },
    ],
  },

  {
    name: "Lifebuoy",
    description: "Antibacterial body wash",
    category: "Personal Care",
    variants: [
      {
        sku: "LFB-250",
        name: "250ml",
        costPrice: 15000,
        sellingPrice: 19000,
      },
    ],
  },

  {
    name: "Sunlight",
    description: "Dishwashing liquid",
    category: "Household",
    variants: [
      {
        sku: "SNL-400",
        name: "400ml",
        costPrice: 9000,
        sellingPrice: 12000,
      },
    ],
  },
];

/**
 * Development users.
 *
 * IMPORTANT:
 * Better Auth owns the user table.
 *
 * We do NOT delete users.
 * We only create these users if they don't already exist.
 */
const SEED_USERS = [
  {
    name: "Budi Santoso",
    email: "budi.cashier@seed.local",
  },
  {
    name: "Siti Aminah",
    email: "siti.cashier@seed.local",
  },
];

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function money(value: number) {
  return value.toFixed(2);
}

/**
 * =========================================================
 * SEED
 * =========================================================
 */

async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed production database");
  }

  console.log("Seeding master data...");

  /*
   * ---------------------------------------------------------
   * 1. CREATE / REUSE DEVELOPMENT USERS
   * ---------------------------------------------------------
   *
   * Do NOT delete the user table because it belongs to
   * Better Auth.
   */
  const cashierIds: string[] = [];

  for (const cashier of SEED_USERS) {
    const [existing] = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.email, cashier.email));

    if (existing) {
      cashierIds.push(existing.id);
      continue;
    }

    const [created] = await db
      .insert(user)
      .values({
        id: randomUUID(),
        name: cashier.name,
        email: cashier.email,
        emailVerified: true,
      })
      .returning({
        id: user.id,
      });

    cashierIds.push(created.id);
  }

  console.log(`Users ready: ${cashierIds.length}`);

  /*
   * ---------------------------------------------------------
   * 2. CLEAR MASTER DATA
   * ---------------------------------------------------------
   *
   * Only master/setup data is removed.
   *
   * We intentionally DO NOT touch:
   *
   * - sale
   * - saleItem
   * - payment
   * - inventoryTransaction
   * - user
   */
  await db.delete(inventoryStock);
  await db.delete(productVariant);
  await db.delete(product);
  await db.delete(category);
  await db.delete(warehouse);

  console.log("Existing master data cleared.");

  /*
   * ---------------------------------------------------------
   * 3. CATEGORIES
   * ---------------------------------------------------------
   */

  const insertedCategories = await db
    .insert(category)
    .values(
      CATEGORIES.map((name) => ({
        name,
      })),
    )
    .returning();

  const categoryMap = new Map(
    insertedCategories.map((item) => [
      item.name,
      item.id,
    ]),
  );

  console.log(
    `Categories created: ${insertedCategories.length}`,
  );

  /*
   * ---------------------------------------------------------
   * 4. WAREHOUSES
   * ---------------------------------------------------------
   */

  const insertedWarehouses = await db
    .insert(warehouse)
    .values(
      WAREHOUSES.map((item) => ({
        code: item.code,
        name: item.name,
        address: item.address,
        isActive: true,
      })),
    )
    .returning();

  console.log(
    `Warehouses created: ${insertedWarehouses.length}`,
  );

  /*
   * ---------------------------------------------------------
   * 5. PRODUCTS
   * ---------------------------------------------------------
   */

  const productRows = PRODUCTS.map((item) => {
    const categoryId = categoryMap.get(item.category);

    if (!categoryId) {
      throw new Error(
        `Category not found: ${item.category}`,
      );
    }

    return {
      name: item.name,
      description: item.description,
      categoryId,
      isActive: true,
    };
  });

  const insertedProducts = await db
    .insert(product)
    .values(productRows)
    .returning();

  console.log(
    `Products created: ${insertedProducts.length}`,
  );

  /*
   * ---------------------------------------------------------
   * 6. PRODUCT VARIANTS
   * ---------------------------------------------------------
   */

  const variantRows = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const productDefinition = PRODUCTS[i];
    const insertedProduct = insertedProducts[i];

    for (const variant of productDefinition.variants) {
      variantRows.push({
        productId: insertedProduct.id,
        sku: variant.sku,
        name: variant.name,
        costPrice: money(variant.costPrice),
        sellingPrice: money(variant.sellingPrice),
        isActive: true,
      });
    }
  }

  const insertedVariants = await db
    .insert(productVariant)
    .values(variantRows)
    .returning();

  console.log(
    `Product variants created: ${insertedVariants.length}`,
  );

  /*
   * ---------------------------------------------------------
   * 7. INITIAL INVENTORY
   * ---------------------------------------------------------
   *
   * inventoryStock represents the initial/current state.
   *
   * We intentionally DO NOT create inventoryTransaction
   * records here because this seed is master/setup data only.
   */
  const stockRows = [];

  for (const warehouseItem of insertedWarehouses) {
    for (const variant of insertedVariants) {
      stockRows.push({
        warehouseId: warehouseItem.id,
        variantId: variant.id,

        /*
         * Initial stock for development.
         *
         * In production, stock would normally be introduced
         * through a stock-in/purchase operation, which would
         * also create an inventory transaction.
         */
        quantity: 100,
      });
    }
  }

  await db
    .insert(inventoryStock)
    .values(stockRows);

  console.log(
    `Inventory stock rows created: ${stockRows.length}`,
  );

  console.log("Master data seeded successfully.");
}

/**
 * =========================================================
 * RUN
 * =========================================================
 */

seed().catch((error) => {
  console.error("Seeding failed:");
  console.error(error);

  process.exit(1);
});
