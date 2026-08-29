import { Card, CardContent } from "@/components/ui/card"
import type { SalesReportSummary } from "@/lib/actions/sales-report"
import { toCurrency } from "./formatters"

type OverviewTabProps = {
    reportSummary: SalesReportSummary
}

export default function OverviewTab({ reportSummary }: OverviewTabProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Sales today"
                    value={reportSummary.today.salesCount}
                    detail="Transactions completed today"
                    accent={`${toCurrency(reportSummary.today.totalRevenue)} revenue`}
                />
                <MetricCard
                    label="Products"
                    value={reportSummary.salesByProduct.length}
                    detail="Distinct products sold"
                    accent={reportSummary.bestSellingProducts[0]?.productName ?? "-"}
                />
                <MetricCard
                    label="Categories"
                    value={reportSummary.salesByCategory.length}
                    detail="Active product categories"
                    accent={reportSummary.salesByCategory[0]?.categoryName ?? "-"}
                />
                <MetricCard
                    label="Best seller"
                    value={reportSummary.bestSellingProducts[0]?.quantity ?? 0}
                    detail="Units sold"
                    accent={reportSummary.bestSellingProducts[0]?.productName ?? "No data"}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <RankedSalesCard
                    title="Top products"
                    detail="Top 5"
                    rows={reportSummary.salesByProduct.slice(0, 5)}
                />
                <RankedSalesCard
                    title="Top categories"
                    detail="Revenue"
                    rows={reportSummary.salesByCategory.slice(0, 5)}
                />
                <RankedSalesCard
                    title="Best sellers"
                    detail="Top 5"
                    rows={reportSummary.bestSellingProducts}
                    numbered
                />
            </div>
        </div>
    )
}

function MetricCard({ label, value, detail, accent }: { label: string; value: string | number; detail: string; accent: string }) {
    return <Card size="sm" className="ring-1 ring-border"><CardContent className="space-y-2"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{detail}</p><p className="text-sm font-medium text-primary">{accent}</p></CardContent></Card>
}

function RankedSalesCard({ title, detail, rows, numbered = false }: { title: string; detail: string; rows: Array<{ productName?: string; categoryName: string | null; quantity: number; totalRevenue: number }>; numbered?: boolean }) {
    return <Card size="sm" className="ring-1 ring-border"><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between"><h3 className="text-base font-medium">{title}</h3><span className="text-xs text-muted-foreground">{detail}</span></div><div className="space-y-2">{rows.map((row, index) => <div key={`${row.productName ?? row.categoryName}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"><div className="flex items-center gap-3">{numbered && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>}<div><p className="font-medium">{row.productName ?? row.categoryName ?? "Uncategorized"}</p>{row.productName && <p className="text-xs text-muted-foreground">{row.categoryName ?? "Uncategorized"}</p>}</div></div><div className="text-right text-sm"><p>{row.quantity} units</p><p className="font-medium text-primary">{toCurrency(row.totalRevenue)}</p></div></div>)}</div></CardContent></Card>
}