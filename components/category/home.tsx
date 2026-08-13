import CategoryTable from "@/components/category/table"
import { getAllCategories } from "@/lib/actions/categories"
import { Card } from "@/components/ui/card"

export default async function CategoriesPage() {
  const result = await getAllCategories()
  if(!result.success) {
    return (
      <Card className="w-full">
        <p className="text-red-500">{result.error}</p>
      </Card>
    )
  }

  return (
     <Card className="w-full">
      <CategoryTable initialCategories={result.data} />
    </Card>
  )
}