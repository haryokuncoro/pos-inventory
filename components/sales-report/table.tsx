"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function SalesReportTable({ initialSales }: SaleTableProps) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredSales = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return initialSales
    }

    return initialSales.filter((row) => {
      return (
        row.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
        row.cashierName.toLowerCase().includes(normalizedQuery) ||
        row.status.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [initialSales, query])

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

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search by invoice, cashier, or status"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />

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
