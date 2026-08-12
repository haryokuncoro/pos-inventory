"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRupiah } from "@/lib/helper"

type SaleRow = {
  id: string
  invoiceNumber: string
  cashierId: string
  cashierName: string
  subtotal: string
  discountAmount: string
  taxAmount: string
  totalAmount: string
  status: "COMPLETED" | "VOIDED"
  soldAt: Date | string
  createdAt: Date | string
}

type SaleTableProps = {
  initialSales: SaleRow[]
}

function toCurrency(amount: string | number) {
  return formatRupiah(Number(amount) || 0)
}

function toDateLabel(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function toNumber(amount: string | number) {
  return Number(amount) || 0
}

export function SalesReportTable({ initialSales }: SaleTableProps) {
  const [query, setQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredSales = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const startBoundary = startDate ? new Date(`${startDate}T00:00:00`) : null
    const endBoundary = endDate ? new Date(`${endDate}T23:59:59.999`) : null

    return initialSales.filter((row) => {
      const soldAtDate = row.soldAt instanceof Date ? row.soldAt : new Date(row.soldAt)

      if (Number.isNaN(soldAtDate.getTime())) {
        return false
      }

      if (startBoundary && soldAtDate < startBoundary) {
        return false
      }

      if (endBoundary && soldAtDate > endBoundary) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return (
        row.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
        row.cashierName.toLowerCase().includes(normalizedQuery) ||
        row.status.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [endDate, initialSales, query, startDate])

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pagedSales = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize
    return filteredSales.slice(startIndex, startIndex + pageSize)
  }, [filteredSales, pageSize, safePage])

  const aggregates = useMemo(() => {
    return filteredSales.reduce(
      (summary, sale) => {
        const subtotal = toNumber(sale.subtotal)
        const discount = toNumber(sale.discountAmount)
        const tax = toNumber(sale.taxAmount)
        const total = toNumber(sale.totalAmount)

        summary.transactions += 1

        if (sale.status === "COMPLETED") {
          summary.completedTransactions += 1
          summary.subtotal += subtotal
          summary.discount += discount
          summary.tax += tax
          summary.total += total
          return summary
        }

        summary.voidedTransactions += 1
        summary.voidedTotal += total
        return summary
      },
      {
        transactions: 0,
        completedTransactions: 0,
        voidedTransactions: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        voidedTotal: 0,
      }
    )
  }, [filteredSales])

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-end md:gap-2">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search by invoice, cashier, or status"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value)
                  setPage(1)
                }}
                className="w-[150px]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value)
                  setPage(1)
                }}
                className="w-[150px]"
              />
            </div>

          </div>
          <div className="flex items-center gap-2 text-sm">
            <Button
              type="button"

              size="sm"
              onClick={() => {
                setStartDate("")
                setEndDate("")
                setPage(1)
              }}
              disabled={!startDate && !endDate}
              className="mb-0.5"
            >
              Reset
            </Button>
          </div>
        </div>


        <div className="flex items-center gap-2 text-sm">
          <Label htmlFor="page-size" className="text-sm text-muted-foreground">
            Rows
          </Label>
          <select
            id="page-size"
            className="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Card size="sm" className="ring-1 ring-border">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Transactions</p>
            <p className="text-2xl font-semibold">{aggregates.transactions}</p>
            <p className="text-xs text-muted-foreground">
              {aggregates.completedTransactions} completed, {aggregates.voidedTransactions} voided
            </p>
          </CardContent>
        </Card>

        <Card size="sm" className="ring-1 ring-border">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Subtotal</p>
            <p className="text-2xl font-semibold">{toCurrency(aggregates.subtotal)}</p>
            <p className="text-xs text-muted-foreground">Completed sales only</p>
          </CardContent>
        </Card>

        <Card size="sm" className="ring-1 ring-border">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Discount</p>
            <p className="text-2xl font-semibold">{toCurrency(aggregates.discount)}</p>
            <p className="text-xs text-muted-foreground">Applied to completed sales</p>
          </CardContent>
        </Card>

        <Card size="sm" className="ring-1 ring-border">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tax</p>
            <p className="text-2xl font-semibold">{toCurrency(aggregates.tax)}</p>
            <p className="text-xs text-muted-foreground">Collected from completed sales</p>
          </CardContent>
        </Card>

        <Card size="sm" className="ring-1 ring-border">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Net Total</p>
            <p className="text-2xl font-semibold">{toCurrency(aggregates.total)}</p>
            <p className="text-xs text-muted-foreground">
              Voided value: {toCurrency(aggregates.voidedTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Sold At</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedSales.length > 0 ? (
              pagedSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                  <TableCell>{toDateLabel(sale.soldAt)}</TableCell>
                  <TableCell>{sale.cashierName}</TableCell>
                  <TableCell className="text-right">{toCurrency(sale.subtotal)}</TableCell>
                  <TableCell className="text-right">{toCurrency(sale.discountAmount)}</TableCell>
                  <TableCell className="text-right">{toCurrency(sale.taxAmount)}</TableCell>
                  <TableCell className="text-right font-semibold">{toCurrency(sale.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === "COMPLETED" ? "default" : "secondary"}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-sm text-muted-foreground">
                  No sales found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {pagedSales.length} of {filteredSales.length} sales
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            disabled={safePage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
            disabled={safePage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
