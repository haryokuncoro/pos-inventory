"use client"

import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SalesReportSummary } from "@/lib/actions/sales-report"
import BreakdownTab from "./breakdown-tab"
import { downloadSalesCsv, toNumber } from "./formatters"
import OverviewTab from "./overview-tab"
import TransactionsTab from "./transactions-tab"
import type { SaleRow, SalesAggregates } from "./types"

type SalesReportTableProps = {
    initialSales: SaleRow[]
    reportSummary: SalesReportSummary
}

const initialAggregates: SalesAggregates = {
    transactions: 0,
    completedTransactions: 0,
    voidedTransactions: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    voidedTotal: 0,
}

export function SalesReportTable({ initialSales, reportSummary }: SalesReportTableProps) {
    const [query, setQuery] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [activeTab, setActiveTab] = useState("overview")

    const filteredSales = useMemo(() => filterSales(initialSales, query, startDate, endDate), [endDate, initialSales, query, startDate])
    const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const pagedSales = useMemo(() => filteredSales.slice((safePage - 1) * pageSize, safePage * pageSize), [filteredSales, pageSize, safePage])
    const aggregates = useMemo(() => getAggregates(filteredSales), [filteredSales])

    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    function resetFilters() {
        setStartDate("")
        setEndDate("")
        setPage(1)
    }

    function updatePageSize(value: number) {
        setPageSize(value)
        setPage(1)
    }

    return <div className="space-y-4 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto bg-muted/40 p-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="best-sellers">Best sellers</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><OverviewTab reportSummary={reportSummary} /></TabsContent>
            <TabsContent value="transactions"><TransactionsTab query={query} startDate={startDate} endDate={endDate} pageSize={pageSize} page={safePage} totalPages={totalPages} filteredSales={filteredSales} pagedSales={pagedSales} aggregates={aggregates} onQueryChange={(value) => { setQuery(value); setPage(1) }} onStartDateChange={(value) => { setStartDate(value); setPage(1) }} onEndDateChange={(value) => { setEndDate(value); setPage(1) }} onResetFilters={resetFilters} onPageSizeChange={updatePageSize} onPageChange={setPage} onDownload={() => downloadSalesCsv(filteredSales)} /></TabsContent>
            <TabsContent value="products"><BreakdownTab title="Sales by product" detail="Qty / Revenue" emptyMessage="No product sales found." rows={reportSummary.salesByProduct} /></TabsContent>
            <TabsContent value="categories"><BreakdownTab title="Sales by category" detail="Qty / Revenue" emptyMessage="No category sales found." rows={reportSummary.salesByCategory} /></TabsContent>
            <TabsContent value="best-sellers"><BreakdownTab title="Best-selling products" detail="Top 5" emptyMessage="No best-selling products available." rows={reportSummary.bestSellingProducts} numbered /></TabsContent>
        </Tabs>
    </div>
}

function filterSales(sales: SaleRow[], query: string, startDate: string, endDate: string) {
    const normalizedQuery = query.trim().toLowerCase()
    const startBoundary = startDate ? new Date(`${startDate}T00:00:00`) : null
    const endBoundary = endDate ? new Date(`${endDate}T23:59:59.999`) : null

    return sales.filter((sale) => {
        const soldAt = sale.soldAt instanceof Date ? sale.soldAt : new Date(sale.soldAt)
        if (Number.isNaN(soldAt.getTime()) || (startBoundary && soldAt < startBoundary) || (endBoundary && soldAt > endBoundary)) return false
        return !normalizedQuery || sale.invoiceNumber.toLowerCase().includes(normalizedQuery) || sale.cashierName.toLowerCase().includes(normalizedQuery) || sale.status.toLowerCase().includes(normalizedQuery)
    })
}

function getAggregates(sales: SaleRow[]): SalesAggregates {
    return sales.reduce((summary, sale) => {
        const total = toNumber(sale.totalAmount)
        summary.transactions += 1
        if (sale.status === "COMPLETED") {
            summary.completedTransactions += 1
            summary.subtotal += toNumber(sale.subtotal)
            summary.discount += toNumber(sale.discountAmount)
            summary.tax += toNumber(sale.taxAmount)
            summary.total += total
        } else {
            summary.voidedTransactions += 1
            summary.voidedTotal += total
        }
        return summary
    }, { ...initialAggregates })
}