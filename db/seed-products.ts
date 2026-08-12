import { db } from "@/db/drizzle";
import {
  category,
  product,
  productVariant,
} from "@/db/schema";
import { eq } from "drizzle-orm";


const TARGET_PRODUCTS = 500;
const INITIAL_STOCK = 100;

const CATEGORIES = [
  "Makanan Beku",
  "Makanan Kaleng",
  "Roti & Kue",
  "Susu & Produk Olahan",
  "Buah & Sayur",
  "Daging & Seafood",
  "Perlengkapan Rumah",
  "Peralatan Dapur",
  "Alat Tulis",
  "Perlengkapan Sekolah",
  "Elektronik Rumah Tangga",
  "Aksesoris Elektronik",
  "Perawatan Kendaraan",
  "Kebutuhan Laundry",
  "Kebutuhan Hewan",
  "Kesehatan",
  "Kosmetik",
  "Perlengkapan Kantor",
  "Mainan Anak",
  "Produk Rumah Tangga",
  "Perlengkapan Perjalanan",
  "Perlengkapan Outdoor",
];

/**
 * PRODUCT CATALOG
 *
 * 25 products per category.
 *
 * 20 categories x 25 products = 500 products.
 */

const PRODUCTS: Record<string, string[]> = {
  "Makanan Beku": [
    "Nugget Ayam",
    "Nugget Ikan",
    "Nugget Sayur",
    "Sosis Ayam",
    "Sosis Sapi",
    "Bakso Sapi",
    "Bakso Ayam",
    "Bakso Ikan",
    "Tempura Udang",
    "Tempura Ikan",
    "Kentang Beku",
    "Kentang Wedges",
    "Chicken Karage",
    "Chicken Wing",
    "Chicken Strip",
    "Dimsum Ayam",
    "Dimsum Udang",
    "Siomay Beku",
    "Risol Mayo Beku",
    "Pempek Beku",
    "Otak-Otak Beku",
    "Pizza Beku",
    "Lasagna Beku",
    "Spaghetti Beku",
    "Kebab Beku",
  ],

  "Makanan Kaleng": [
    "Sarden Tomat",
    "Sarden Pedas",
    "Sarden Original",
    "Kornet Sapi",
    "Kornet Ayam",
    "Tuna Kaleng",
    "Makarel Kaleng",
    "Jagung Kaleng",
    "Kacang Polong Kaleng",
    "Jamur Kaleng",
    "Leci Kaleng",
    "Nanas Kaleng",
    "Susu Kental Manis",
    "Santan Kaleng",
    "Kacang Merah Kaleng",
    "Baked Beans",
    "Daging Ayam Kaleng",
    "Daging Sapi Kaleng",
    "Sup Ayam Kaleng",
    "Sup Krim Kaleng",
    "Buah Cocktail Kaleng",
    "Kacang Hijau Kaleng",
    "Tomat Kaleng",
    "Pasta Saus Kaleng",
    "Tuna Pedas Kaleng",
  ],

  "Roti & Kue": [
    "Roti Tawar",
    "Roti Gandum",
    "Roti Sobek Cokelat",
    "Roti Sobek Keju",
    "Roti Sobek Susu",
    "Roti Isi Cokelat",
    "Roti Isi Keju",
    "Roti Isi Kacang",
    "Roti Isi Stroberi",
    "Croissant",
    "Donat Gula",
    "Donat Cokelat",
    "Donat Keju",
    "Donat Stroberi",
    "Muffin Cokelat",
    "Muffin Vanila",
    "Brownies",
    "Bolu Pandan",
    "Bolu Cokelat",
    "Bolu Keju",
    "Kue Lapis",
    "Pancake",
    "Waffle",
    "Cheesecake",
    "Cupcake",
  ],

  "Susu & Produk Olahan": [
    "Susu Pasteurisasi",
    "Susu Cokelat",
    "Susu Stroberi",
    "Susu Vanilla",
    "Susu Pisang",
    "Yogurt Original",
    "Yogurt Stroberi",
    "Yogurt Blueberry",
    "Yogurt Mangga",
    "Yogurt Melon",
    "Keju Cheddar",
    "Keju Mozzarella",
    "Keju Slice",
    "Keju Parmesan",
    "Butter",
    "Margarin",
    "Krim Kental",
    "Whipping Cream",
    "Krim Keju",
    "Puding Susu",
    "Puding Cokelat",
    "Puding Vanilla",
    "Es Krim Vanila",
    "Es Krim Cokelat",
    "Es Krim Stroberi",
  ],

  "Buah & Sayur": [
    "Apel",
    "Jeruk",
    "Pisang",
    "Mangga",
    "Pepaya",
    "Semangka",
    "Melon",
    "Anggur",
    "Pir",
    "Alpukat",
    "Jambu",
    "Nanas",
    "Tomat",
    "Wortel",
    "Kentang",
    "Bawang Merah",
    "Bawang Putih",
    "Cabai Merah",
    "Cabai Rawit",
    "Kol",
    "Bayam",
    "Kangkung",
    "Brokoli",
    "Kembang Kol",
    "Terong",
  ],

  "Daging & Seafood": [
    "Daging Sapi Has",
    "Daging Sapi Giling",
    "Daging Sapi Iga",
    "Daging Sapi Sandung Lamur",
    "Daging Sapi Steak",
    "Daging Sapi Tenderloin",
    "Daging Ayam Fillet",
    "Daging Ayam Paha",
    "Daging Ayam Dada",
    "Daging Ayam Sayap",
    "Daging Ayam Utuh",
    "Ikan Nila",
    "Ikan Lele",
    "Ikan Kembung",
    "Ikan Tongkol",
    "Ikan Bandeng",
    "Ikan Gurame",
    "Ikan Kakap",
    "Udang Kupas",
    "Udang Segar",
    "Cumi-Cumi",
    "Kerang",
    "Kepiting",
    "Daging Kambing",
    "Daging Bebek",
  ],

  "Perlengkapan Rumah": [
    "Sapu Lantai",
    "Sapu Lidi",
    "Pengki",
    "Pel Lantai",
    "Ember Plastik",
    "Baskom Plastik",
    "Tempat Sampah",
    "Rak Serbaguna",
    "Gantungan Baju",
    "Jemuran Pakaian",
    "Keset Kaki",
    "Tirai Jendela",
    "Sarung Bantal",
    "Sarung Guling",
    "Sprei",
    "Selimut",
    "Bantal",
    "Handuk",
    "Kain Lap",
    "Spons Cuci",
    "Kotak Penyimpanan",
    "Keranjang Plastik",
    "Organizer Meja",
    "Rak Sepatu",
    "Tempat Payung",
  ],

  "Peralatan Dapur": [
    "Panci Aluminium",
    "Panci Stainless",
    "Wajan Aluminium",
    "Wajan Anti Lengket",
    "Teflon",
    "Spatula",
    "Sutil",
    "Sendok Sayur",
    "Saringan",
    "Parutan",
    "Pisau Dapur",
    "Talenan",
    "Pembuka Botol",
    "Pembuka Kaleng",
    "Penjepit Makanan",
    "Gelas Plastik",
    "Gelas Kaca",
    "Piring Melamin",
    "Mangkuk Melamin",
    "Kotak Makan",
    "Termos Air",
    "Cangkir Keramik",
    "Sendok Stainless",
    "Garpu Stainless",
    "Set Alat Makan",
  ],

  "Alat Tulis": [
    "Pulpen Hitam",
    "Pulpen Biru",
    "Pulpen Merah",
    "Pulpen Hijau",
    "Pensil 2B",
    "Pensil HB",
    "Penghapus Putih",
    "Penghapus Pensil",
    "Rautan Pensil",
    "Penggaris 30cm",
    "Penggaris 15cm",
    "Spidol Hitam",
    "Spidol Biru",
    "Spidol Merah",
    "Spidol Hijau",
    "Stabilo Kuning",
    "Stabilo Hijau",
    "Stabilo Pink",
    "Correction Pen",
    "Correction Tape",
    "Lem Kertas",
    "Gunting Kertas",
    "Cutter",
    "Pensil Mekanik",
    "Isi Pensil Mekanik",
  ],

  "Perlengkapan Sekolah": [
    "Buku Tulis",
    "Buku Gambar",
    "Buku Kotak",
    "Buku Agenda",
    "Buku Catatan",
    "Pensil Warna",
    "Krayon",
    "Cat Air",
    "Kuas Lukis",
    "Tas Sekolah",
    "Tas Selempang",
    "Kotak Pensil",
    "Tempat Minum",
    "Kotak Bekal",
    "Map Plastik",
    "Map Kertas",
    "Binder",
    "Sticky Notes",
    "Kertas Origami",
    "Kartu Indeks",
    "Buku Matematika",
    "Buku Bahasa",
    "Buku IPA",
    "Papan Tulis Mini",
    "Spidol Papan Tulis",
  ],

  "Elektronik Rumah Tangga": [
    "Lampu LED 5W",
    "Lampu LED 7W",
    "Lampu LED 9W",
    "Lampu LED 12W",
    "Lampu LED 15W",
    "Lampu LED 18W",
    "Lampu Tidur",
    "Lampu Emergency",
    "Kipas Angin Mini",
    "Kipas Angin Meja",
    "Setrika",
    "Rice Cooker",
    "Blender",
    "Mixer",
    "Dispenser Air",
    "Ketel Listrik",
    "Pemanggang Roti",
    "Vacuum Cleaner Mini",
    "Hair Dryer",
    "Timbangan Digital",
    "Mesin Kopi Mini",
    "Juicer",
    "Air Fryer",
    "Slow Cooker",
    "Toaster",
  ],

  "Aksesoris Elektronik": [
    "Kabel USB Type C",
    "Kabel Micro USB",
    "Kabel Lightning",
    "Kabel HDMI",
    "Charger USB",
    "Charger Type C",
    "Adaptor USB",
    "Power Bank",
    "Earphone Kabel",
    "Headset Bluetooth",
    "Mouse Wireless",
    "Keyboard Wireless",
    "Mouse Pad",
    "USB Flash Drive",
    "Memory Card",
    "Card Reader",
    "USB Hub",
    "Stand HP",
    "Holder HP",
    "Cleaning Kit Elektronik",
    "Webcam USB",
    "Kabel AUX",
    "Bluetooth Speaker",
    "Phone Ring Holder",
    "Laptop Stand",
  ],

  "Perawatan Kendaraan": [
    "Oli Mesin Motor",
    "Oli Mesin Mobil",
    "Cairan Rem",
    "Cairan Radiator",
    "Air Aki",
    "Cairan Wiper",
    "Shampoo Motor",
    "Shampoo Mobil",
    "Wax Mobil",
    "Poles Ban",
    "Lap Microfiber",
    "Spons Cuci Mobil",
    "Pengharum Mobil",
    "Pembersih Dashboard",
    "Pembersih Kaca Mobil",
    "Semir Ban",
    "Chain Lube",
    "Brake Cleaner",
    "Engine Cleaner",
    "Kain Chamois",
    "Pembersih Jok",
    "Pembersih Velg",
    "Poles Body",
    "Cairan Anti Karat",
    "Kompresor Mini",
  ],

  "Kebutuhan Laundry": [
    "Deterjen Cair",
    "Deterjen Sachet",
    "Deterjen Premium",
    "Pewangi Laundry",
    "Pelembut Laundry",
    "Pemutih Laundry",
    "Penghilang Noda",
    "Sabun Colek",
    "Kapur Barus",
    "Parfum Laundry",
    "Plastik Laundry",
    "Hanger Plastik",
    "Hanger Besi",
    "Jepitan Pakaian",
    "Keranjang Laundry",
    "Laundry Net",
    "Sikat Pakaian",
    "Sikat Sepatu",
    "Sarung Tangan Laundry",
    "Botol Spray Laundry",
    "Pembersih Mesin Cuci",
    "Pewangi Setrika",
    "Kantong Laundry",
    "Bola Laundry",
    "Rak Laundry",
  ],

  "Kebutuhan Hewan": [
    "Makanan Kucing",
    "Makanan Kucing Tuna",
    "Makanan Kucing Ayam",
    "Makanan Kucing Kitten",
    "Makanan Kucing Salmon",
    "Makanan Anjing",
    "Makanan Anjing Puppy",
    "Makanan Anjing Beef",
    "Snack Kucing",
    "Snack Anjing",
    "Pasir Kucing",
    "Pasir Kucing Wangi",
    "Shampoo Kucing",
    "Shampoo Anjing",
    "Vitamin Hewan",
    "Kalung Kucing",
    "Kalung Anjing",
    "Tali Anjing",
    "Tempat Makan Hewan",
    "Tempat Minum Hewan",
    "Mainan Kucing",
    "Mainan Anjing",
    "Sisir Kucing",
    "Sisir Anjing",
    "Kandang Hewan Mini",
  ],

  "Kesehatan": [
    "Masker Medis",
    "Masker Anak",
    "Plester Luka",
    "Kasa Steril",
    "Kapas Medis",
    "Termometer Digital",
    "Hand Sanitizer",
    "Antiseptik",
    "Alkohol Swab",
    "Sarung Tangan Medis",
    "Vitamin C",
    "Vitamin D",
    "Minyak Kayu Putih",
    "Balsem",
    "Minyak Angin",
    "Koyo Hangat",
    "Oralit",
    "Tisu Antiseptik",
    "Kotak P3K",
    "Kompres Instan",
    "Masker KN95",
    "Kapas Bulat",
    "Cotton Bud",
    "Tisu Medis",
    "Ice Pack",
  ],

  "Kosmetik": [
    "Lip Balm",
    "Lip Tint",
    "Lip Cream",
    "Lipstick",
    "Bedak Tabur",
    "Bedak Padat",
    "Foundation",
    "BB Cream",
    "CC Cream",
    "Blush On",
    "Eyeshadow",
    "Eyeliner",
    "Mascara",
    "Pensil Alis",
    "Makeup Remover",
    "Micellar Water",
    "Face Wash",
    "Toner",
    "Serum Wajah",
    "Masker Wajah",
    "Sunscreen",
    "Moisturizer",
    "Primer",
    "Setting Spray",
    "Makeup Sponge",
  ],

  "Perlengkapan Kantor": [
    "Kertas A4",
    "Kertas F4",
    "Kertas A5",
    "Amplop Putih",
    "Amplop Cokelat",
    "Binder Clip",
    "Paper Clip",
    "Stapler",
    "Isi Stapler",
    "Pelubang Kertas",
    "Map Ordner",
    "Map Folder",
    "Label Stiker",
    "Lakban Bening",
    "Lakban Cokelat",
    "Double Tape",
    "Nota Kosong",
    "Buku Kas",
    "Buku Ekspedisi",
    "Kalkulator",
    "Papan Presentasi",
    "Clipboard",
    "Memo Pad",
    "Folder Arsip",
    "Tempat Dokumen",
  ],

  "Mainan Anak": [
    "Puzzle Kayu",
    "Puzzle Angka",
    "Puzzle Huruf",
    "Balok Susun",
    "Mobil Mainan",
    "Motor Mainan",
    "Pesawat Mainan",
    "Boneka Kecil",
    "Boneka Beruang",
    "Bola Plastik",
    "Bola Karet",
    "Layang-Layang",
    "Mainan Masak",
    "Mainan Dokter",
    "Mainan Musik",
    "Gelembung Sabun",
    "Kartu Edukasi",
    "Papan Gambar",
    "Clay Anak",
    "Robot Mainan",
    "Kereta Mainan",
    "Puzzle Hewan",
    "Puzzle Kendaraan",
    "Balok Angka",
    "Mainan Telepon",
  ],

  "Produk Rumah Tangga": [
    "Plastik Sampah Kecil",
    "Plastik Sampah Sedang",
    "Plastik Sampah Besar",
    "Plastik Klip",
    "Aluminium Foil",
    "Plastic Wrap",
    "Kertas Roti",
    "Tisu Wajah",
    "Tisu Toilet",
    "Tisu Dapur",
    "Tisu Makan",
    "Korek Api",
    "Lilin",
    "Baterai AA",
    "Baterai AAA",
    "Baterai D",
    "Kantong Belanja",
    "Sarung Tangan Karet",
    "Masker Debu",
    "Jas Hujan Plastik",
    "Kantong Ziplock",
    "Kain Serbaguna",
    "Spons Serbaguna",
    "Kawat Pembersih",
    "Tali Serbaguna",
  ],

  "Perlengkapan Perjalanan": [
    "Koper Kabin",
    "Koper Medium",
    "Koper Besar",
    "Tas Travel",
    "Tas Pinggang",
    "Tas Paspor",
    "Bantal Leher",
    "Penutup Mata",
    "Earplug Travel",
    "Botol Travel",
    "Botol Spray Travel",
    "Travel Organizer",
    "Kunci Koper",
    "Timbangan Bagasi",
    "Payung Lipat",
    "Jas Hujan Travel",
    "Sandal Travel",
    "Sikat Gigi Travel",
    "Kantong Sepatu",
    "Laundry Bag Travel",
    "Adaptor Travel",
    "Tas Toiletries",
    "Kantong Vakum",
    "Travel Towel",
    "Travel Pillow",
  ],

  "Perlengkapan Outdoor": [
    "Tenda 2 Orang",
    "Tenda 4 Orang",
    "Tenda 6 Orang",
    "Matras Camping",
    "Sleeping Bag",
    "Kompor Camping",
    "Gas Portable",
    "Lampu Camping",
    "Senter LED",
    "Headlamp",
    "Botol Minum Outdoor",
    "Tumbler",
    "Kursi Lipat",
    "Meja Lipat",
    "Tas Gunung",
    "Rain Cover Tas",
    "Jas Hujan Outdoor",
    "Peluit Outdoor",
    "Tali Paracord",
    "Korek Api Outdoor",
    "Terpal Camping",
    "Kompas",
    "Peralatan Hiking",
    "Tongkat Hiking",
    "Ponco Outdoor",
  ],
};


function money(value: number) {
  return value.toFixed(2);
}

function code(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

function generatePrice(index: number) {
  const costPrice =
    3000 +
    ((index * 137) % 97000);

  const marginPercent =
    15 + (index % 6) * 5;

  const sellingPrice =
    Math.ceil(
      (costPrice *
        (1 + marginPercent / 100)) /
        500,
    ) * 500;

  return {
    costPrice,
    sellingPrice,
  };
}

function validateCatalog() {
  if (CATEGORIES.length !== 20) {
    throw new Error(
      `Expected 20 categories, got ${CATEGORIES.length}`,
    );
  }

  for (const categoryName of CATEGORIES) {
    const products = PRODUCTS[categoryName];

    if (!products) {
      throw new Error(
        `Missing product catalog for category: ${categoryName}`,
      );
    }

    if (products.length !== 25) {
      throw new Error(
        `Category "${categoryName}" must contain 25 products. ` +
          `Got ${products.length}`,
      );
    }
  }

  const totalProducts = Object.values(
    PRODUCTS,
  ).reduce(
    (total, products) =>
      total + products.length,
    0,
  );

  if (totalProducts !== TARGET_PRODUCTS) {
    throw new Error(
      `Expected ${TARGET_PRODUCTS} products, got ${totalProducts}`,
    );
  }
}


async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Refusing to seed production database",
    );
  }

  console.log(
    "Starting product seed #2...",
  );


  validateCatalog();

  console.log(
    `Catalog validated: ${TARGET_PRODUCTS} products`,
  );

  const categoryMap = new Map<
    string,
    string
  >();

  for (const categoryName of CATEGORIES) {
    const [existing] = await db
      .select({
        id: category.id,
        name: category.name,
      })
      .from(category)
      .where(
        eq(category.name, categoryName),
      );

    if (existing) {
      categoryMap.set(
        existing.name,
        existing.id,
      );

      continue;
    }

    const [created] = await db
      .insert(category)
      .values({
        name: categoryName,
      })
      .returning({
        id: category.id,
        name: category.name,
      });

    categoryMap.set(
      created.name,
      created.id,
    );
  }

  console.log(
    `Categories ready: ${categoryMap.size}`,
  );

  const existingProductNames = new Set(
    (
      await db
        .select({
          name: product.name,
        })
        .from(product)
    ).map((item) =>
      item.name.trim().toLowerCase(),
    ),
  );

  const newProductDefinitions: {
    name: string;
    category: string;
    description: string;
    index: number;
  }[] = [];

  let productIndex = 0;

  for (const categoryName of CATEGORIES) {
    const products =
      PRODUCTS[categoryName];

    for (const productName of products) {
      const normalizedName =
        productName
          .trim()
          .toLowerCase();

      if (
        existingProductNames.has(
          normalizedName,
        )
      ) {
        continue;
      }

      newProductDefinitions.push({
        name: productName,
        category: categoryName,
        description: `${productName} untuk kebutuhan sehari-hari.`,
        index: productIndex,
      });

      productIndex++;
    }
  }

  console.log(
    `New products to insert: ${newProductDefinitions.length}`,
  );


  if (
    newProductDefinitions.length === 0
  ) {
    console.log(
      "All products already exist. Nothing to insert.",
    );

    return;
  }

  const productRows =
    newProductDefinitions.map(
      (item) => {
        const categoryId =
          categoryMap.get(
            item.category,
          );

        if (!categoryId) {
          throw new Error(
            `Category not found: ${item.category}`,
          );
        }

        return {
          name: item.name,
          description:
            item.description,
          categoryId,
          isActive: true,
        };
      },
    );

  const insertedProducts = await db
    .insert(product)
    .values(productRows)
    .returning({
      id: product.id,
      name: product.name,
    });

  console.log(
    `Products inserted: ${insertedProducts.length}`,
  );


  const variantRows =
    insertedProducts.map(
      (insertedProduct, index) => {
        const definition =
          newProductDefinitions[index];

        const prices = generatePrice(
          definition.index,
        );

        const categoryCode = code(
          definition.category,
        );

        const productCode = code(
          definition.name,
        );

        const sku =
          `S2-${categoryCode}-${productCode}-${String(
            definition.index + 1,
          ).padStart(4, "0")}`;

        return {
          productId:
            insertedProduct.id,

          sku,

          name: "Default",

          costPrice: money(
            prices.costPrice,
          ),

          sellingPrice: money(
            prices.sellingPrice,
          ),

          stockQuantity:
            INITIAL_STOCK,

          isActive: true,
        };
      },
    );

  const insertedVariants = await db
    .insert(productVariant)
    .values(variantRows)
    .returning({
      id: productVariant.id,
    });

  console.log(
    `Variants inserted: ${insertedVariants.length}`,
  );

  console.log("");

  console.log(
    "==========================================",
  );

  console.log(
    "Product seed #2 completed.",
  );

  console.log(
    `New categories : ${categoryMap.size}`,
  );

  console.log(
    `New products   : ${insertedProducts.length}`,
  );

  console.log(
    `New variants   : ${insertedVariants.length}`,
  );

  console.log(
    `Initial stock  : ${INITIAL_STOCK}`,
  );

  console.log(
    "Existing data : PRESERVED",
  );

  console.log(
    "Transactions   : UNTOUCHED",
  );

  console.log(
    "==========================================",
  );
}


seed().catch((error) => {
  console.error(
    "Product seed #2 failed:",
  );

  console.error(error);

  process.exit(1);
});