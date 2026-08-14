import { db } from "@/db/drizzle";
import {
  user,
  category,
  product,
  productVariant,
  store,
  storeSettings,
} from "@/db/schema";

import { eq } from "drizzle-orm";
import {auth} from "@/lib/auth";

// MASTER DATA

const CATEGORIES = [
  "Minuman",
  "Makanan Pokok",
  "Makanan Instan",
  "Camilan",
  "Perawatan Diri",
  "Kebersihan Rumah",
  "Bumbu & Bahan Masak",
  "Kebutuhan Bayi",
];

const PRODUCTS = [
  // MINUMAN

  {
    name: "Air Mineral",
    description: "Air mineral dalam kemasan untuk kebutuhan sehari-hari.",
    category: "Minuman",
    variants: [
      {
        sku: "AM-330",
        name: "330 ml",
        costPrice: 1800,
        sellingPrice: 2500,
      },
      {
        sku: "AM-600",
        name: "600 ml",
        costPrice: 2500,
        sellingPrice: 3500,
      },
      {
        sku: "AM-1500",
        name: "1,5 Liter",
        costPrice: 4500,
        sellingPrice: 6000,
      },
    ],
  },

  {
    name: "Teh Botol",
    description: "Minuman teh siap minum dalam kemasan.",
    category: "Minuman",
    variants: [
      {
        sku: "TB-350",
        name: "350 ml",
        costPrice: 3200,
        sellingPrice: 5000,
      },
    ],
  },

  {
    name: "Minuman Teh Manis",
    description: "Minuman teh manis siap minum.",
    category: "Minuman",
    variants: [
      {
        sku: "TM-350",
        name: "350 ml",
        costPrice: 2500,
        sellingPrice: 4000,
      },
    ],
  },

  {
    name: "Minuman Jeruk",
    description: "Minuman rasa jeruk siap minum.",
    category: "Minuman",
    variants: [
      {
        sku: "MJ-350",
        name: "350 ml",
        costPrice: 2800,
        sellingPrice: 4500,
      },
    ],
  },

  {
    name: "Kopi Susu",
    description: "Minuman kopi susu siap minum.",
    category: "Minuman",
    variants: [
      {
        sku: "KS-250",
        name: "250 ml",
        costPrice: 4500,
        sellingPrice: 7000,
      },
    ],
  },

  {
    name: "Kopi Hitam",
    description: "Kopi hitam siap minum.",
    category: "Minuman",
    variants: [
      {
        sku: "KH-250",
        name: "250 ml",
        costPrice: 3500,
        sellingPrice: 5500,
      },
    ],
  },

  {
    name: "Susu UHT",
    description: "Susu cair UHT untuk konsumsi sehari-hari.",
    category: "Minuman",
    variants: [
      {
        sku: "SU-200",
        name: "200 ml",
        costPrice: 4500,
        sellingPrice: 6500,
      },
      {
        sku: "SU-1000",
        name: "1 Liter",
        costPrice: 16000,
        sellingPrice: 21000,
      },
    ],
  },

  {
    name: "Sari Buah",
    description: "Minuman sari buah dalam kemasan.",
    category: "Minuman",
    variants: [
      {
        sku: "SB-250",
        name: "250 ml",
        costPrice: 3000,
        sellingPrice: 5000,
      },
    ],
  },

  // MAKANAN POKOK

  {
    name: "Beras Premium",
    description: "Beras putih premium untuk kebutuhan rumah tangga.",
    category: "Makanan Pokok",
    variants: [
      {
        sku: "BP-5KG",
        name: "5 kg",
        costPrice: 68000,
        sellingPrice: 78000,
      },
      {
        sku: "BP-10KG",
        name: "10 kg",
        costPrice: 132000,
        sellingPrice: 150000,
      },
    ],
  },

  {
    name: "Beras Medium",
    description: "Beras putih kualitas medium.",
    category: "Makanan Pokok",
    variants: [
      {
        sku: "BM-5KG",
        name: "5 kg",
        costPrice: 58000,
        sellingPrice: 68000,
      },
    ],
  },

  {
    name: "Gula Pasir",
    description: "Gula pasir putih untuk kebutuhan rumah tangga.",
    category: "Makanan Pokok",
    variants: [
      {
        sku: "GP-1KG",
        name: "1 kg",
        costPrice: 15000,
        sellingPrice: 18000,
      },
    ],
  },

  {
    name: "Tepung Terigu",
    description: "Tepung terigu serbaguna untuk memasak dan membuat kue.",
    category: "Makanan Pokok",
    variants: [
      {
        sku: "TT-500",
        name: "500 gram",
        costPrice: 7000,
        sellingPrice: 9000,
      },
      {
        sku: "TT-1KG",
        name: "1 kg",
        costPrice: 13000,
        sellingPrice: 16000,
      },
    ],
  },

  {
    name: "Minyak Goreng",
    description: "Minyak goreng untuk kebutuhan memasak.",
    category: "Makanan Pokok",
    variants: [
      {
        sku: "MG-1L",
        name: "1 Liter",
        costPrice: 16000,
        sellingPrice: 19000,
      },
      {
        sku: "MG-2L",
        name: "2 Liter",
        costPrice: 31000,
        sellingPrice: 36000,
      },
    ],
  },

  {
    name: "Telur Ayam",
    description: "Telur ayam untuk kebutuhan memasak.",
    category: "Makanan Pokok",
    variants: [
      {
        sku: "TA-1KG",
        name: "1 kg",
        costPrice: 28000,
        sellingPrice: 34000,
      },
    ],
  },

  {
    name: "Susu Bubuk",
    description: "Susu bubuk untuk konsumsi keluarga.",
    category: "Makanan Pokok",
    variants: [
      {
        sku: "SBK-250",
        name: "250 gram",
        costPrice: 22000,
        sellingPrice: 28000,
      },
    ],
  },

  // MAKANAN INSTAN

  {
    name: "Mi Goreng",
    description: "Mi instan rasa goreng.",
    category: "Makanan Instan",
    variants: [
      {
        sku: "MIG-ORI",
        name: "Rasa Original",
        costPrice: 2500,
        sellingPrice: 3500,
      },
    ],
  },

  {
    name: "Mi Kuah Ayam",
    description: "Mi instan dengan kuah rasa ayam.",
    category: "Makanan Instan",
    variants: [
      {
        sku: "MIK-AYM",
        name: "Rasa Ayam",
        costPrice: 2500,
        sellingPrice: 3500,
      },
    ],
  },

  {
    name: "Mi Kuah Soto",
    description: "Mi instan dengan rasa soto.",
    category: "Makanan Instan",
    variants: [
      {
        sku: "MIK-STO",
        name: "Rasa Soto",
        costPrice: 2500,
        sellingPrice: 3500,
      },
    ],
  },

  {
    name: "Bubur Instan",
    description: "Bubur instan yang praktis disajikan.",
    category: "Makanan Instan",
    variants: [
      {
        sku: "BI-AYM",
        name: "Rasa Ayam",
        costPrice: 4500,
        sellingPrice: 6500,
      },
    ],
  },

  {
    name: "Sereal Sarapan",
    description: "Sereal praktis untuk sarapan.",
    category: "Makanan Instan",
    variants: [
      {
        sku: "SS-250",
        name: "250 gram",
        costPrice: 19000,
        sellingPrice: 25000,
      },
    ],
  },

  {
    name: "Makaroni",
    description: "Makaroni kering untuk dimasak.",
    category: "Makanan Instan",
    variants: [
      {
        sku: "MK-250",
        name: "250 gram",
        costPrice: 9000,
        sellingPrice: 12000,
      },
    ],
  },

  // CAMILAN

  {
    name: "Keripik Kentang",
    description: "Keripik kentang renyah dengan rasa gurih.",
    category: "Camilan",
    variants: [
      {
        sku: "KK-68",
        name: "68 gram",
        costPrice: 8000,
        sellingPrice: 11000,
      },
      {
        sku: "KK-120",
        name: "120 gram",
        costPrice: 13000,
        sellingPrice: 17000,
      },
    ],
  },

  {
    name: "Keripik Singkong",
    description: "Keripik singkong renyah dan gurih.",
    category: "Camilan",
    variants: [
      {
        sku: "KS-80",
        name: "80 gram",
        costPrice: 6500,
        sellingPrice: 9000,
      },
    ],
  },

  {
    name: "Kerupuk",
    description: "Kerupuk gurih untuk camilan.",
    category: "Camilan",
    variants: [
      {
        sku: "KR-100",
        name: "100 gram",
        costPrice: 5000,
        sellingPrice: 7500,
      },
    ],
  },

  {
    name: "Biskuit Cokelat",
    description: "Biskuit dengan rasa cokelat.",
    category: "Camilan",
    variants: [
      {
        sku: "BC-120",
        name: "120 gram",
        costPrice: 7000,
        sellingPrice: 10000,
      },
    ],
  },

  {
    name: "Biskuit Susu",
    description: "Biskuit rasa susu untuk keluarga.",
    category: "Camilan",
    variants: [
      {
        sku: "BS-120",
        name: "120 gram",
        costPrice: 6500,
        sellingPrice: 9500,
      },
    ],
  },

  {
    name: "Wafer Cokelat",
    description: "Wafer renyah dengan lapisan cokelat.",
    category: "Camilan",
    variants: [
      {
        sku: "WC-70",
        name: "70 gram",
        costPrice: 5000,
        sellingPrice: 7500,
      },
    ],
  },

  {
    name: "Permen Buah",
    description: "Permen rasa buah untuk camilan.",
    category: "Camilan",
    variants: [
      {
        sku: "PB-100",
        name: "100 gram",
        costPrice: 7000,
        sellingPrice: 10000,
      },
    ],
  },

  {
    name: "Kacang Panggang",
    description: "Kacang panggang gurih untuk camilan.",
    category: "Camilan",
    variants: [
      {
        sku: "KP-100",
        name: "100 gram",
        costPrice: 9000,
        sellingPrice: 12000,
      },
    ],
  },

  // PERAWATAN DIRI

  {
    name: "Sabun Mandi Cair",
    description: "Sabun mandi cair untuk membersihkan tubuh.",
    category: "Perawatan Diri",
    variants: [
      {
        sku: "SMC-250",
        name: "250 ml",
        costPrice: 12000,
        sellingPrice: 16000,
      },
    ],
  },

  {
    name: "Sabun Mandi Batang",
    description: "Sabun mandi batang untuk kebutuhan sehari-hari.",
    category: "Perawatan Diri",
    variants: [
      {
        sku: "SMB-90",
        name: "90 gram",
        costPrice: 3500,
        sellingPrice: 5000,
      },
    ],
  },

  {
    name: "Sampo",
    description: "Sampo untuk membersihkan rambut.",
    category: "Perawatan Diri",
    variants: [
      {
        sku: "SMP-170",
        name: "170 ml",
        costPrice: 15000,
        sellingPrice: 20000,
      },
    ],
  },

  {
    name: "Pasta Gigi",
    description: "Pasta gigi untuk menjaga kebersihan gigi.",
    category: "Perawatan Diri",
    variants: [
      {
        sku: "PG-120",
        name: "120 gram",
        costPrice: 11000,
        sellingPrice: 15000,
      },
    ],
  },

  {
    name: "Sikat Gigi",
    description: "Sikat gigi untuk penggunaan sehari-hari.",
    category: "Perawatan Diri",
    variants: [
      {
        sku: "SG-DWS",
        name: "Dewasa",
        costPrice: 6000,
        sellingPrice: 9000,
      },
      {
        sku: "SG-ANK",
        name: "Anak-anak",
        costPrice: 5500,
        sellingPrice: 8500,
      },
    ],
  },

  {
    name: "Deodoran",
    description: "Deodoran untuk membantu mengurangi bau badan.",
    category: "Perawatan Diri",
    variants: [
      {
        sku: "DD-50",
        name: "50 ml",
        costPrice: 14000,
        sellingPrice: 19000,
      },
    ],
  },

  {
    name: "Pelembap Tubuh",
    description: "Pelembap untuk membantu menjaga kelembapan kulit.",
    category: "Perawatan Diri",
    variants: [
      {
        sku: "PT-200",
        name: "200 ml",
        costPrice: 17000,
        sellingPrice: 23000,
      },
    ],
  },

  // KEBERSIHAN RUMAH

  {
    name: "Sabun Cuci Piring",
    description: "Sabun cair untuk mencuci peralatan makan.",
    category: "Kebersihan Rumah",
    variants: [
      {
        sku: "SCP-400",
        name: "400 ml",
        costPrice: 9000,
        sellingPrice: 12000,
      },
      {
        sku: "SCP-800",
        name: "800 ml",
        costPrice: 17000,
        sellingPrice: 22000,
      },
    ],
  },

  {
    name: "Deterjen Bubuk",
    description: "Deterjen bubuk untuk mencuci pakaian.",
    category: "Kebersihan Rumah",
    variants: [
      {
        sku: "DB-450",
        name: "450 gram",
        costPrice: 9000,
        sellingPrice: 12000,
      },
      {
        sku: "DB-900",
        name: "900 gram",
        costPrice: 17000,
        sellingPrice: 22000,
      },
    ],
  },

  {
    name: "Pelembut Pakaian",
    description: "Pelembut dan pewangi pakaian.",
    category: "Kebersihan Rumah",
    variants: [
      {
        sku: "PP-800",
        name: "800 ml",
        costPrice: 13000,
        sellingPrice: 18000,
      },
    ],
  },

  {
    name: "Pembersih Lantai",
    description: "Cairan pembersih untuk lantai rumah.",
    category: "Kebersihan Rumah",
    variants: [
      {
        sku: "PL-450",
        name: "450 ml",
        costPrice: 9000,
        sellingPrice: 13000,
      },
    ],
  },

  {
    name: "Pembersih Kaca",
    description: "Cairan pembersih kaca dan permukaan mengkilap.",
    category: "Kebersihan Rumah",
    variants: [
      {
        sku: "PK-500",
        name: "500 ml",
        costPrice: 10000,
        sellingPrice: 14000,
      },
    ],
  },

  {
    name: "Pemutih Pakaian",
    description: "Cairan pemutih untuk pakaian putih.",
    category: "Kebersihan Rumah",
    variants: [
      {
        sku: "PPP-500",
        name: "500 ml",
        costPrice: 7000,
        sellingPrice: 10000,
      },
    ],
  },

  // BUMBU & BAHAN MASAK

  {
    name: "Garam Dapur",
    description: "Garam halus untuk kebutuhan memasak.",
    category: "Bumbu & Bahan Masak",
    variants: [
      {
        sku: "GD-500",
        name: "500 gram",
        costPrice: 3500,
        sellingPrice: 5000,
      },
    ],
  },

  {
    name: "Kaldu Ayam",
    description: "Bumbu kaldu rasa ayam untuk masakan.",
    category: "Bumbu & Bahan Masak",
    variants: [
      {
        sku: "KA-100",
        name: "100 gram",
        costPrice: 7000,
        sellingPrice: 10000,
      },
    ],
  },

  {
    name: "Kecap Manis",
    description: "Kecap manis untuk berbagai masakan.",
    category: "Bumbu & Bahan Masak",
    variants: [
      {
        sku: "KM-135",
        name: "135 ml",
        costPrice: 8000,
        sellingPrice: 11000,
      },
      {
        sku: "KM-600",
        name: "600 ml",
        costPrice: 18000,
        sellingPrice: 24000,
      },
    ],
  },

  {
    name: "Saus Sambal",
    description: "Saus sambal dengan rasa pedas.",
    category: "Bumbu & Bahan Masak",
    variants: [
      {
        sku: "SS-135",
        name: "135 ml",
        costPrice: 7500,
        sellingPrice: 10000,
      },
    ],
  },

  {
    name: "Saus Tomat",
    description: "Saus tomat untuk pelengkap makanan.",
    category: "Bumbu & Bahan Masak",
    variants: [
      {
        sku: "ST-135",
        name: "135 ml",
        costPrice: 7000,
        sellingPrice: 9500,
      },
    ],
  },

  {
    name: "Merica Bubuk",
    description: "Merica bubuk untuk bumbu masakan.",
    category: "Bumbu & Bahan Masak",
    variants: [
      {
        sku: "MB-50",
        name: "50 gram",
        costPrice: 6000,
        sellingPrice: 8500,
      },
    ],
  },

  {
    name: "Bawang Goreng",
    description: "Bawang goreng siap pakai sebagai pelengkap makanan.",
    category: "Bumbu & Bahan Masak",
    variants: [
      {
        sku: "BG-100",
        name: "100 gram",
        costPrice: 12000,
        sellingPrice: 16000,
      },
    ],
  },

  // =======================================================
  // KEBUTUHAN BAYI
  // =======================================================

  {
    name: "Popok Bayi",
    description: "Popok sekali pakai untuk bayi.",
    category: "Kebutuhan Bayi",
    variants: [
      {
        sku: "PB-S20",
        name: "Ukuran S - 20 pcs",
        costPrice: 30000,
        sellingPrice: 38000,
      },
      {
        sku: "PB-M20",
        name: "Ukuran M - 20 pcs",
        costPrice: 32000,
        sellingPrice: 40000,
      },
      {
        sku: "PB-L20",
        name: "Ukuran L - 20 pcs",
        costPrice: 34000,
        sellingPrice: 43000,
      },
    ],
  },

  {
    name: "Tisu Basah Bayi",
    description: "Tisu basah lembut untuk kebutuhan bayi.",
    category: "Kebutuhan Bayi",
    variants: [
      {
        sku: "TBB-50",
        name: "50 lembar",
        costPrice: 9000,
        sellingPrice: 13000,
      },
    ],
  },

  {
    name: "Sabun Bayi",
    description: "Sabun lembut untuk membersihkan kulit bayi.",
    category: "Kebutuhan Bayi",
    variants: [
      {
        sku: "SBB-100",
        name: "100 ml",
        costPrice: 13000,
        sellingPrice: 18000,
      },
    ],
  },

  {
    name: "Sampo Bayi",
    description: "Sampo lembut untuk rambut bayi.",
    category: "Kebutuhan Bayi",
    variants: [
      {
        sku: "SPB-100",
        name: "100 ml",
        costPrice: 14000,
        sellingPrice: 19000,
      },
    ],
  },

  {
    name: "Minyak Telon",
    description: "Minyak telon untuk kebutuhan bayi.",
    category: "Kebutuhan Bayi",
    variants: [
      {
        sku: "MT-60",
        name: "60 ml",
        costPrice: 16000,
        sellingPrice: 22000,
      },
    ],
  },
];


// Better Auth User
const SEED_USERS = [
  {
    name: "admin",
    email: "admin@mail.com",
    isAdmin: true,
  },
  {
    name: "Budi Santoso",
    email: "budi.cashier@seed.local",
    isAdmin: false,
  },
  {
    name: "Siti Aminah",
    email: "siti.cashier@seed.local",
    isAdmin: false,
  },
];

// HELPERS

function money(value: number) {
  return value.toFixed(2);
}

async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Refusing to seed production database",
    );
  }

  console.log("Seeding master data...");

  // CREATE / REUSE DEVELOPMENT USERS

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

    const created = await auth.api.createUser({
    body: {
            email: cashier.email, 
            password: "password", 
            name: cashier.name, 
            role: cashier.isAdmin ? "admin" : "user",
            data: { customField: "customValue" },
        },
    });

    cashierIds.push(created.user.id);
  }

  console.log(
    `Users ready: ${cashierIds.length}`,
  );

   // CLEAR MASTER DATA
  await db.delete(productVariant);
  await db.delete(product);
  await db.delete(category);

  console.log("Existing master data cleared.");

  // Store + Store Settings
  const [newStore] = await db
    .insert(store)
    .values({
      name: "My Store",
      code: "STORE-001",
      address: "Jl. Contoh No. 123",
      phone: "081234567890",
      email: "store@example.com",
      isActive: true,
    })
    .returning({
      id: store.id,
    });

  await db.insert(storeSettings).values({
    storeId: newStore.id,

    receiptHeader: "MY STORE",
    receiptFooter: "Terima kasih telah berbelanja",

    taxEnabled: false,
    taxRate: "0",

    currency: "IDR",
    timezone: "Asia/Jakarta",

    allowNegativeStock: false,
  });

  console.log(`Store created: ${newStore.id}`);

  // CATEGORIES

  const insertedCategories = await db
    .insert(category)
    .values(
      CATEGORIES.map((name) => ({
        storeId: newStore.id,
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

  // PRODUCTS

  const productRows = PRODUCTS.map((item) => {
    const categoryId = categoryMap.get(
      item.category,
    );

    if (!categoryId) {
      throw new Error(
        `Category not found: ${item.category}`,
      );
    }

    return {
      name: item.name,
      storeId: newStore.id,
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

  // PRODUCT VARIANTS + INITIAL STOCK

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

        sellingPrice: money(
          variant.sellingPrice,
        ),

        /**
         * Initial stock for development.
         */
        stockQuantity: 100,

        isActive: true,
      });
    }
  }

  const insertedVariants = await db
    .insert(productVariant)
    .values(variantRows)
    .returning({
      id: productVariant.id,
    });

  console.log(
    `Product variants created: ${insertedVariants.length}`,
  );

  console.log(
    `Initial stock assigned to ${insertedVariants.length} variants.`,
  );

  // SUMMARY

  const totalProducts = PRODUCTS.length;

  const totalVariants = PRODUCTS.reduce(
    (total, product) =>
      total + product.variants.length,
    0,
  );

  console.log("");
  console.log(
    "==========================================",
  );
  console.log("Master data seeded successfully.");
  console.log(
    `Categories : ${CATEGORIES.length}`,
  );
  console.log(
    `Products   : ${totalProducts}`,
  );
  console.log(
    `Variants   : ${totalVariants}`,
  );
 
}


seed().catch((error) => {
  console.error("Seeding failed:");
  console.error(error);

  process.exit(1);
});
