import { Card } from "@/components/ui/card"
import { getAllCategories } from "@/lib/actions/categories"
import { CategoryTable } from "./table"

export default async function CategoryHomePage() {
  const categories = await getAllCategories()

  return (
    <Card className="w-full">
      <CategoryTable initialCategories={categories} />
    </Card>
  )
}
