"use client"

import * as React from "react"
import { FileUp, Download, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import {
  parseProductCsv,
  type ParsedProductImportRow,
} from "@/lib/actions/import/parse-product-csv"
import { importProducts } from "@/lib/actions/import/import-products"

type ImportProductsDialogProps = {
  userId: string
  onSuccess?: () => void
}

export function ImportProductsDialog({
  userId,
  onSuccess,
}: ImportProductsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [rows, setRows] = React.useState<
    ParsedProductImportRow[]
  >([])
  const [isParsing, setIsParsing] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(
    null,
  )

  const validRows = React.useMemo(
    () => rows.filter((row) => row.errors.length === 0),
    [rows],
  )

  const invalidRows = React.useMemo(
    () => rows.filter((row) => row.errors.length > 0),
    [rows],
  )

  const canImport =
    rows.length > 0 &&
    invalidRows.length === 0 &&
    !isParsing &&
    !isImporting

  function reset() {
    setFile(null)
    setRows([])
    setError(null)
    setIsParsing(false)
    setIsImporting(false)
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)

    if (!value) {
      reset()
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    setError(null)
    setRows([])
    setFile(selectedFile)
    setIsParsing(true)

    try {
      if (
        !selectedFile.name.toLowerCase().endsWith(".csv")
      ) {
        throw new Error("Please upload a CSV file.")
      }

      const parsed = await parseProductCsv(selectedFile)

      setRows(parsed)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to parse CSV file.",
      )
    } finally {
      setIsParsing(false)
    }
  }

  async function handleImport() {
    if (!canImport) {
      return
    }

    setError(null)
    setIsImporting(true)

    try {
      const data = validRows
        .map((row) => row.data)
        .filter(
          (
            row,
          ): row is NonNullable<
            ParsedProductImportRow["data"]
          > => Boolean(row),
        )

      const result = await importProducts(
        data,
        userId,
      )

      if (!result.success) {
        throw new Error(result.message ?? "Failed to import products.")
      }

      setOpen(false)
      reset()

      onSuccess?.()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to import products.",
      )
    } finally {
      setIsImporting(false)
    }
  }

  function handleDownloadTemplate() {
    const csv = [
      "name,category,variantName,sku,costPrice,sellingPrice,stockQuantity",
      "Indomie Goreng,Mie Instan,85g,IND-GRG-85,2500,3500,100",
      "Aqua,Minuman,600ml,AQUA-600,2500,4000,50",
    ].join("\n")

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "product-import-template.csv"

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      
    <DialogTrigger render={<Button variant="outline">  <FileUp /> Import Products</Button>} />


      <DialogContent className="flex w-full max-w-4xl flex-col gap-6 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            Import Products
          </DialogTitle>

          <DialogDescription>
            
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">
                Don&apos;t have a template?
              </p>

              <p className="text-sm text-muted-foreground">
                Download the CSV template and fill in your
                products.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 size-4" />
              Download Template
            </Button>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <label
              htmlFor="product-import-file"
              className="text-sm font-medium"
            >
              CSV File
            </label>

            <div className="flex items-center gap-2">
              <Input
                id="product-import-file"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                disabled={isParsing || isImporting}
              />

              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={reset}
                  disabled={isParsing || isImporting}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Parsing */}
          {isParsing && (
            <div className="flex items-center gap-2 rounded-lg border p-4 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Reading CSV file...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Summary */}
          {rows.length > 0 && !isParsing && (
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Total Rows
                </p>

                <p className="text-2xl font-semibold">
                  {rows.length}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Valid
                </p>

                <p className="text-2xl font-semibold text-green-600">
                  {validRows.length}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Errors
                </p>

                <p className="text-2xl font-semibold text-destructive">
                  {invalidRows.length}
                </p>
              </div>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <div className="rounded-lg border">
              <div className="border-b p-4">
                <h3 className="font-medium">
                  Preview
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review your products before importing.
                </p>
              </div>
              <div className="border-b p-4 flex justify-end">

                 <Button
                    type="button"
                    onClick={handleImport}
                    disabled={!canImport}
                  >
                    {isImporting && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}

                    {isImporting
                      ? "Importing..."
                      : `Import ${validRows.length} Products`}
                  </Button>
              </div>

              <div className="max-h-100 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">
                        Row
                      </th>

                      <th className="px-4 py-3 text-left font-medium">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left font-medium">
                        Category
                      </th>

                      <th className="px-4 py-3 text-left font-medium">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Cost
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Selling
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Stock
                      </th>

                      <th className="px-4 py-3 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => {
                      const data = row.data
                      const hasError =
                        row.errors.length > 0

                      return (
                        <tr
                          key={row.rowNumber}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-3">
                            {row.rowNumber}
                          </td>

                          <td className="px-4 py-3">
                            {data?.name ?? "-"}
                          </td>

                          <td className="px-4 py-3">
                            {data?.category ?? "-"}
                          </td>

                          <td className="px-4 py-3 font-mono">
                            {data?.sku ?? "-"}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {data?.costPrice ?? "-"}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {data?.sellingPrice ?? "-"}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {data?.stockQuantity ?? "-"}
                          </td>

                          <td className="px-4 py-3">
                            {hasError ? (
                              <div className="space-y-1">
                                <p className="font-medium text-destructive">
                                  Invalid
                                </p>

                                <div className="text-xs text-destructive">
                                  {row.errors.map(
                                    (message) => (
                                      <p key={message}>
                                        {message}
                                      </p>
                                    ),
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="font-medium text-green-600">
                                Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!file && !isParsing && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
              <Upload className="mb-4 size-8 text-muted-foreground" />

              <p className="font-medium">
                Upload your CSV file
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                CSV files only
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          
        <DialogClose render={<Button variant="outline">Cancel</Button>} />


         
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}