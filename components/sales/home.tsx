import { Card } from "@/components/ui/card"
import { getAllCategories } from "@/lib/actions/categories"
import { getSaleProductsPaginated } from "@/lib/actions/sales"
import { PosPage } from "./pos"

type SaleHomePageProps = {
  query?: string
  page?: number
}

export default async function SaleHomePage({
  query,
  page,
}: SaleHomePageProps) {
  const pageSize = 12
  const [catalogResult, categories] = await Promise.all([
    getSaleProductsPaginated({
      page,
      pageSize,
      query,
    }),
    getAllCategories(),
  ])

  return (
    <Card className="w-full max-w-6xl">
      <PosPage
        products={catalogResult.items}
        categories={categories.map((category) => category.name)}
        searchQuery={query ?? ""}
        page={catalogResult.page}
        totalPages={catalogResult.totalPages}
        totalItems={catalogResult.totalItems}
      />
    </Card>
  )
}
