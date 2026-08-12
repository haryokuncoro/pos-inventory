import { Card } from "@/components/ui/card"
import { getAllCategories } from "@/lib/actions/categories"
import { getProductsPaginated } from "@/lib/actions/products"
import ProductTable from "@/components/product/table"

export default async function ImportProductHomePage() {
  const [products, categories] = await Promise.all([
    getProductsPaginated({
      page: 1,
      pageSize: 10,
      query: "",
    }),
    getAllCategories(),
  ])

  return (
    <Card className="w-full">
      <ProductTable initialProducts={products} initialCategories={categories} />
    </Card>
  )
}
