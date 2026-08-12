import { Card } from "@/components/ui/card"
import { getAllCategories } from "@/lib/actions/categories"
import { getAllProducts } from "@/lib/actions/products"
import ProductTable from "./table"

export default async function ProductHomePage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ])

  return (
    <Card className="w-full">
      <ProductTable initialProducts={products} initialCategories={categories} />
    </Card>
  )
}
