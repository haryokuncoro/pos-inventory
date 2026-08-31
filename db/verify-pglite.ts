/**
 * Temporary verification harness: exercises the Postgres-specific query
 * features on PGlite. Not part of the shipped app.
 */
import { config } from "dotenv";

config({ path: ".env" });

async function main() {
  const { db, pgliteDb } = await import("@/db/drizzle");
  const { product, productVariant, sale, saleItem, category } = await import(
    "@/db/schema"
  );
  const { sql, and, eq, desc } = await import("drizzle-orm");

  if (!pgliteDb) {
    throw new Error("Expected the pglite driver");
  }

  const client = (pgliteDb as unknown as { $client: import("@electric-sql/pglite").PGlite }).$client;

  console.log("--- migration ledger ---");
  const ledger = await client.query<{ hash: string; created_at: string }>(
    `select hash, created_at from drizzle.__drizzle_migrations order by created_at`,
  );
  console.log(`rows: ${ledger.rows.length}`);

  console.log("--- enum types created ---");
  const enums = await client.query<{ typname: string }>(
    `select typname from pg_type where typtype = 'e' order by typname`,
  );
  console.log(enums.rows.map((r) => r.typname).join(", "));

  console.log("--- check constraints ---");
  const checks = await client.query<{ n: number }>(
    `select count(*)::int as n from pg_constraint where contype = 'c'
       and connamespace = 'public'::regnamespace`,
  );
  console.log(`count: ${checks.rows[0].n}`);

  console.log("--- ilike + correlated EXISTS (products.ts pattern) ---");
  const keyword = "%aqua%";
  const found = await db
    .select({
      id: product.id,
      name: product.name,
      total: sql<number>`count(*) over ()`,
    })
    .from(product)
    .where(
      sql`(${product.name} ilike ${keyword} or exists (
        select 1 from ${productVariant}
        where ${productVariant.productId} = ${product.id}
          and (${productVariant.name} ilike ${keyword} or ${productVariant.sku} ilike ${keyword})
      ))`,
    )
    .limit(5);
  console.log(`matches: ${found.length}`, found.map((f) => f.name));

  console.log("--- count(*)::int over derived table (sales.ts pattern) ---");
  const base = db
    .select({ id: product.id })
    .from(product)
    .where(eq(product.isActive, true));
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(base.as("catalog_count"));
  console.log(`active products: ${total} (typeof ${typeof total})`);

  console.log("--- aggregates on EMPTY sales (sales-report.ts pattern) ---");
  const [summary] = await db
    .select({
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${sale.totalAmount})::float8, 0)`,
    })
    .from(sale);
  console.log(summary, `typeof revenue = ${typeof summary.revenue}`);

  const byCategory = await db
    .select({
      name: category.name,
      qty: sql<number>`cast(sum(${saleItem.quantity}) as integer)`,
      revenue: sql<number>`coalesce(sum(${saleItem.subtotal})::float8, 0)`,
    })
    .from(saleItem)
    .innerJoin(productVariant, eq(saleItem.variantId, productVariant.id))
    .innerJoin(product, eq(productVariant.productId, product.id))
    .innerJoin(category, eq(product.categoryId, category.id))
    .groupBy(category.id, category.name)
    .orderBy(desc(sql`coalesce(sum(${saleItem.subtotal})::float8, 0)`));
  console.log(`category rows on empty data: ${byCategory.length}`);

  console.log("--- numeric(15,2) returns strings ---");
  const [variant] = await db
    .select({ price: productVariant.price, stock: productVariant.stockQuantity })
    .from(productVariant)
    .limit(1);
  console.log(variant, `typeof price = ${typeof variant.price}`);

  console.log("--- transaction ROLLBACK ---");
  const [target] = await db
    .select({ id: productVariant.id, stock: productVariant.stockQuantity })
    .from(productVariant)
    .limit(1);
  console.log(`stock before: ${target.stock}`);

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(productVariant)
        .set({ stockQuantity: sql`${productVariant.stockQuantity} - 5` })
        .where(
          and(
            eq(productVariant.id, target.id),
            sql`${productVariant.stockQuantity} >= 5`,
          ),
        );

      throw new Error("forced rollback");
    });
  } catch (error) {
    console.log(`caught: ${(error as Error).message}`);
  }

  const [after] = await db
    .select({ stock: productVariant.stockQuantity })
    .from(productVariant)
    .where(eq(productVariant.id, target.id));
  console.log(
    `stock after: ${after.stock} -> ${after.stock === target.stock ? "ROLLED BACK OK" : "LEAKED!"}`,
  );

  console.log("--- transaction COMMIT ---");
  await db.transaction(async (tx) => {
    await tx
      .update(productVariant)
      .set({ stockQuantity: sql`${productVariant.stockQuantity} - 3` })
      .where(eq(productVariant.id, target.id));
  });
  const [committed] = await db
    .select({ stock: productVariant.stockQuantity })
    .from(productVariant)
    .where(eq(productVariant.id, target.id));
  console.log(
    `stock after commit: ${committed.stock} -> ${
      committed.stock === target.stock - 3 ? "COMMITTED OK" : "WRONG"
    }`,
  );

  console.log("--- onConflictDoNothing (import pattern) ---");
  const [existing] = await db
    .select({ sku: productVariant.sku, productId: productVariant.productId, name: productVariant.name })
    .from(productVariant)
    .limit(1);
  const conflicted = await db
    .insert(productVariant)
    .values({
      productId: existing.productId,
      name: existing.name,
      sku: existing.sku,
      price: "1.00",
      costPrice: "1.00",
      stockQuantity: 1,
    })
    .onConflictDoNothing({ target: productVariant.sku })
    .returning({ id: productVariant.id });
  console.log(
    `inserted rows on duplicate sku: ${conflicted.length} -> ${
      conflicted.length === 0 ? "SKIPPED OK" : "UNEXPECTED INSERT"
    }`,
  );

  console.log("--- relational query API ---");
  const rel = await db.query.product.findFirst({
    with: { variants: { columns: { sku: true } } },
  });
  console.log(`variants via relations: ${rel?.variants?.length ?? 0}`);

  console.log("\nALL PGLITE CHECKS PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
