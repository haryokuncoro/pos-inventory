import { Card } from "@/components/ui/card"
import { getAllCategories } from "@/lib/actions/categories"
import { getAllProducts } from "@/lib/actions/products"
import { PosPage } from "./pos"

export default async function SaleHomePage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ])

  const saleProducts = products.flatMap((product) =>
    (product.variants ?? []).
      filter((variant) => variant.isActive)
      .map((variant) => ({
        id: variant.id,
        name: product.name,
        variantName: variant.name,
        sku: variant.sku,
        category: product.categoryName ?? "Uncategorized",
        sellingPrice: Number(variant.sellingPrice),
        stockQuantity: Number(variant.stockQuantity ?? 0),
      })),
  )

  return (
    <Card className="w-full">
      <PosPage products={saleProducts} categories={categories.map((category) => category.name)} />
    </Card>
  )
}
