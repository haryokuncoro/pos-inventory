import CategoryTable from "@/components/category/table"
import { getAllCategories } from "@/lib/actions/categories"
import { Card } from "@/components/ui/card"

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
     <Card className="w-full">
      <CategoryTable initialCategories={categories} />
    </Card>
  )
}