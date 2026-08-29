import { Card, CardContent } from "@/components/ui/card"
import { toCurrency } from "./formatters"

type BreakdownRow = {
    productName?: string
    categoryName: string | null
    quantity: number
    totalRevenue: number
}

type BreakdownTabProps = {
    title: string
    detail: string
    emptyMessage: string
    rows: BreakdownRow[]
    numbered?: boolean
}

export default function BreakdownTab({ title, detail, emptyMessage, rows, numbered = false }: BreakdownTabProps) {
    return <Card size="sm" className="ring-1 ring-border"><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between"><h3 className="text-base font-medium">{title}</h3><span className="text-xs text-muted-foreground">{detail}</span></div><div className="space-y-2">{rows.length > 0 ? rows.map((row, index) => <div key={`${row.productName ?? row.categoryName}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"><div className="flex items-center gap-3">{numbered && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>}<div><p className="font-medium">{row.productName ?? row.categoryName ?? "Uncategorized"}</p>{row.productName && <p className="text-xs text-muted-foreground">{row.categoryName ?? "Uncategorized"}</p>}</div></div><div className="text-right text-sm"><p>{row.quantity} units</p><p className="font-medium text-primary">{toCurrency(row.totalRevenue)}</p></div></div>) : <p className="text-sm text-muted-foreground">{emptyMessage}</p>}</div></CardContent></Card>
}