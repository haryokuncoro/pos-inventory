"use client"
import { toast } from "sonner"
import ProductDialogForm, { type ProductFormValues } from "./dialog-form"

import { useEffect, useMemo, useState } from "react"
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
import type { SelectCategory, SelectProduct } from "@/db/schema"
import { createProduct, deleteProduct, updateProduct } from "@/lib/actions/products"

type ProductRow = SelectProduct & {
  categoryName?: string | null
  variants?: Array<{
    id: string
    productId: string
    stockQuantity: number
    sku: string
    name: string
    costPrice: string
    sellingPrice: string
    isActive: boolean
  }>
}

type ProductTableProps = {
  initialProducts: ProductRow[]
  initialCategories: SelectCategory[]
}

export function ProductTable({ initialProducts, initialCategories }: ProductTableProps) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts)
  const [categories] = useState<SelectCategory[]>(initialCategories)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return products
    }

    return products.filter((product) => {
      const categoryName = product.categoryName?.toLowerCase() ?? ""
      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        categoryName.includes(normalizedQuery)
      )
    })
  }, [products, query])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pagedProducts = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize
    return filteredProducts.slice(startIndex, startIndex + pageSize)
  }, [filteredProducts, pageSize, safePage])

  const resetModal = () => {
    setDialogOpen(false)
    setSelectedProduct(null)
  }

  const openCreateModal = () => {
    setSelectedProduct(null)
    setDialogOpen(true)
  }

  const openEditModal = (product: ProductRow) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const variantsPayload = (values.variants ?? []).map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        stockQuantity: variant.stockQuantity,
        name: variant.name,
        costPrice: variant.costPrice,
        sellingPrice: variant.sellingPrice,
        isActive: variant.isActive,
      }))

      if (selectedProduct) {
        const updatedProduct = await updateProduct(
          selectedProduct.id,
          {
            name: values.name,
            categoryId: values.categoryId,
            description: values.description || null,
            isActive: values.isActive,
          },
          variantsPayload,
        )

        const categoryName =
          categories.find((category) => category.id === values.categoryId)?.name ?? null

        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === selectedProduct.id
              ? {
                ...product,
                name: updatedProduct?.product?.name ?? values.name,
                categoryId: values.categoryId,
                description: values.description || null,
                isActive: values.isActive,
                categoryName,
                variants: updatedProduct?.variants?.map((variant) => ({
                  id: variant.id,
                  productId: variant.productId,
                  sku: variant.sku,
                  stockQuantity: variant.stockQuantity,
                  name: variant.name,
                  costPrice: String(variant.costPrice),
                  sellingPrice: String(variant.sellingPrice),
                  isActive: variant.isActive,
                })),
              }
              : product
          )
        )
      } else {
        const createdResult = await createProduct(
          {
            name: values.name,
            categoryId: values.categoryId,
            description: values.description || null,
            isActive: values.isActive,
          },
          variantsPayload,
        )

        const categoryName =
          categories.find((category) => category.id === values.categoryId)?.name ?? null

        if (createdResult) {
          setProducts((currentProducts) => [
            {
              ...createdResult.product,
              categoryName,
              variants: createdResult.variants.map((variant) => ({
                id: variant.id,
                productId: variant.productId,
                sku: variant.sku,
                stockQuantity: variant.stockQuantity,
                name: variant.name,
                costPrice: String(variant.costPrice),
                sellingPrice: String(variant.sellingPrice),
                isActive: variant.isActive,
              })),
            } as ProductRow,
            ...currentProducts,
          ])
        }
      }

      resetModal()
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm("Delete this product?")
    if (!confirmed) {
      return
    }

    try {
      await deleteProduct(productId)
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId))
      toast.success("Product deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product.")
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search by name or category"
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

      <div className="flex justify-end">
        <ProductDialogForm
          selectedProduct={selectedProduct}
          categories={categories}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          resetModal={resetModal}
          onSubmit={onSubmit}
          openCreateModal={openCreateModal}
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedProducts.length > 0 ? (
              pagedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categoryName ?? "—"}</TableCell>
                  <TableCell>
                    {product.variants?.length ? product.variants.map((variant) => variant.sku).join(", ") : "—"}
                  </TableCell>
                  <TableCell>{product.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(product)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {pagedProducts.length} of {filteredProducts.length} products
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
