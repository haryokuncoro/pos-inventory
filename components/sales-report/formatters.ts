import { formatRupiah } from "@/lib/helper";
import type { SaleRow } from "./types";

export function toCurrency(amount: string | number) {
  return formatRupiah(Number(amount) || 0);
}

export function toDateLabel(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toNumber(amount: string | number) {
  return Number(amount) || 0;
}

function toCsvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function downloadSalesCsv(sales: SaleRow[]) {
  const rows = sales.map((sale) => [
    sale.invoiceNumber,
    new Date(sale.soldAt).toISOString(),
    sale.cashierName,
    sale.subtotal,
    sale.discountAmount,
    sale.taxAmount,
    sale.totalAmount,
    sale.status,
  ]);
  const csv = [
    [
      "Invoice",
      "Sold At",
      "Cashier",
      "Subtotal",
      "Discount",
      "Tax",
      "Total",
      "Status",
    ],
    ...rows,
  ]
    .map((row) => row.map(toCsvCell).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "sales-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}
