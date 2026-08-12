import { Card } from "@/components/ui/card"
import { getAllSales } from "@/lib/actions/sales"
import { SalesReportTable } from "./table"

export default async function SalesReportHome() {
  const [sales] = await Promise.all([
    getAllSales(),
  ])

  return (
    <Card className="w-full">
      <SalesReportTable initialSales={sales}  />
    </Card>
  )
}
