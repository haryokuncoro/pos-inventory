import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toCurrency, toDateLabel } from "./formatters"
import type { SaleRow, SalesAggregates } from "./types"

type TransactionsTabProps = {
    query: string
    startDate: string
    endDate: string
    pageSize: number
    page: number
    totalPages: number
    filteredSales: SaleRow[]
    pagedSales: SaleRow[]
    aggregates: SalesAggregates
    onQueryChange: (value: string) => void
    onStartDateChange: (value: string) => void
    onEndDateChange: (value: string) => void
    onResetFilters: () => void
    onPageSizeChange: (value: number) => void
    onPageChange: (value: number) => void
    onDownload: () => void
}

export default function TransactionsTab(props: TransactionsTabProps) {
    const { aggregates, endDate, filteredSales, onDownload, onEndDateChange, onPageChange, onPageSizeChange, onQueryChange, onResetFilters, onStartDateChange, page, pageSize, pagedSales, query, startDate, totalPages } = props

    return <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-end md:gap-2">
                <div className="w-full max-w-sm"><Input placeholder="Search by invoice, cashier, or status" value={query} onChange={(event) => onQueryChange(event.target.value)} /></div>
                <div className="flex items-center gap-2">
                    <DateFilter id="start-date" label="From" value={startDate} onChange={onStartDateChange} />
                    <DateFilter id="end-date" label="To" value={endDate} onChange={onEndDateChange} />
                </div>
                <Button type="button" size="sm" onClick={onResetFilters} disabled={!startDate && !endDate} className="mb-0.5">Reset</Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <Button type="button" variant="outline" size="sm" onClick={onDownload} disabled={filteredSales.length === 0}><Download />Download CSV</Button>
                <Label htmlFor="page-size" className="text-sm text-muted-foreground">Rows</Label>
                <select id="page-size" className="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
                    <option value="5">5</option><option value="10">10</option><option value="25">25</option>
                </select>
            </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Transactions" value={aggregates.transactions} detail={`${aggregates.completedTransactions} completed, ${aggregates.voidedTransactions} voided`} />
            <SummaryCard label="Subtotal" value={toCurrency(aggregates.subtotal)} detail="Completed sales only" />
            <SummaryCard label="Discount" value={toCurrency(aggregates.discount)} detail="Applied to completed sales" />
            <SummaryCard label="Tax" value={toCurrency(aggregates.tax)} detail="Collected from completed sales" />
            <SummaryCard label="Net Total" value={toCurrency(aggregates.total)} detail={`Voided value: ${toCurrency(aggregates.voidedTotal)}`} />
        </div>

        <div className="overflow-hidden rounded-xl border"><Table><TableHeader><TableRow>{["Invoice", "Sold At", "Cashier", "Subtotal", "Discount", "Tax", "Total", "Status"].map((label) => <TableHead key={label} className={["Subtotal", "Discount", "Tax", "Total"].includes(label) ? "text-right" : undefined}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{pagedSales.length > 0 ? pagedSales.map((sale) => <TableRow key={sale.id}><TableCell className="font-medium">{sale.invoiceNumber}</TableCell><TableCell>{toDateLabel(sale.soldAt)}</TableCell><TableCell>{sale.cashierName}</TableCell><TableCell className="text-right">{toCurrency(sale.subtotal)}</TableCell><TableCell className="text-right">{toCurrency(sale.discountAmount)}</TableCell><TableCell className="text-right">{toCurrency(sale.taxAmount)}</TableCell><TableCell className="text-right font-semibold">{toCurrency(sale.totalAmount)}</TableCell><TableCell><Badge variant={sale.status === "COMPLETED" ? "default" : "secondary"}>{sale.status}</Badge></TableCell></TableRow>) : <TableRow><TableCell colSpan={8} className="py-6 text-center text-sm text-muted-foreground">No sales found.</TableCell></TableRow>}</TableBody></Table></div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><p className="text-sm text-muted-foreground">Showing {pagedSales.length} of {filteredSales.length} sales</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(page - 1, 1))} disabled={page === 1}>Previous</Button><span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span><Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(page + 1, totalPages))} disabled={page === totalPages}>Next</Button></div></div>
    </div>
}

function DateFilter({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
    return <div className="space-y-1"><Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label><Input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} className="w-[150px]" /></div>
}

function SummaryCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
    return <Card size="sm" className="ring-1 ring-border"><CardContent className="space-y-1"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{detail}</p></CardContent></Card>
}