import { Card } from "@/components/ui/card"
import { getAllSales, getSalesReportSummary } from "@/lib/actions/sales"
import { SalesReportTable } from "./table"

export default async function SalesReportHome() {
  const [sales, summary] = await Promise.all([
    getAllSales(),
    getSalesReportSummary(),
  ])

  return (
    <Card className="w-full">
      <SalesReportTable initialSales={sales} reportSummary={summary} />
    </Card>
  )
}
