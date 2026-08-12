import { z } from "zod"

export const productImportRowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required"),

  category: z
    .string()
    .trim()
    .min(1, "Category is required"),

  variantName: z
    .string()
    .trim()
    .min(1, "Variant name is required"),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required"),

  costPrice: z
    .coerce
    .number()
    .finite()
    .min(0, "Cost price must be >= 0"),

  sellingPrice: z
    .coerce
    .number()
    .finite()
    .min(0, "Selling price must be >= 0"),

  stockQuantity: z
    .coerce
    .number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity must be >= 0"),
})

export type ProductImportRow =
  z.infer<typeof productImportRowSchema>