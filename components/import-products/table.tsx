"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import type { SelectCategory, SelectProduct } from "@/db/schema"
import {
  deleteProduct,
  getProductsPaginated,
  type PaginatedProductsResult,
} from "@/lib/actions/products"
import { useRouter } from "next/navigation"
import ProductList from "@/components/product/list"
import ProductToolbar from "@/components/product/toolbar"
import GeneralPagination from "@/components/dashboard/pagination"
import { ImportProductsDialog } from "./import"
import { authClient } from "@/lib/auth-client"


export type ProductRow = SelectProduct & {
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
  initialProducts: PaginatedProductsResult
  initialCategories: SelectCategory[]
}



export default function ProductTable({ initialProducts }: ProductTableProps) {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  
  const [products, setProducts] = useState<ProductRow[]>(initialProducts.items)

  const [query, setQuery] = useState("")
  const [page, setPage] = useState(initialProducts.page)
  const [pageSize, setPageSize] = useState(initialProducts.pageSize)
  const [totalItems, setTotalItems] = useState(initialProducts.totalItems)
  const [totalPages, setTotalPages] = useState(initialProducts.totalPages)
  const [isPending, startTransition] = useTransition()
  const initialLoadCompletedRef = useRef(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null)

  const fetchProducts = useCallback(async (
    nextPage = page,
    nextPageSize = pageSize,
    nextQuery = query,
  ) => {
    const result = await getProductsPaginated({
      page: nextPage,
      pageSize: nextPageSize,
      query: nextQuery,
    })

    setProducts(result.items)
    setTotalItems(result.totalItems)
    setTotalPages(result.totalPages)

    if (result.page !== nextPage) {
      setPage(result.page)
    }
  }, [page, pageSize, query])

  useEffect(() => {
    if (!initialLoadCompletedRef.current) {
      initialLoadCompletedRef.current = true
      return
    }

    startTransition(() => {
      fetchProducts().catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to fetch products."
        )
      })
    })
  }, [fetchProducts, page, pageSize, query])

 
  const openEditModal = (product: ProductRow) => {
    setSelectedProduct(product)

  }

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm("Delete this product?")
    if (!confirmed) {
      return
    }

    try {
      await deleteProduct(productId)
      await fetchProducts()
      toast.success("Product deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product.")
    }
  }

  return (
    <div className="space-y-4 p-4">
      <ProductToolbar
        query={query}
        pageSize={pageSize}
        onQueryChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        onPageSizeChange={(value) => {
          setPageSize(value)
          setPage(1)
        }}
      />

      <div className="flex justify-end">
        <ImportProductsDialog
          userId={session?.user.id ?? ""}
          onSuccess={() => {
            router.refresh()
          }}
        />

      </div>

      <ProductList
        products={products}
        isLoading={isPending}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <GeneralPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        currentItems={products.length}
        disabled={isPending}
        onPrevious={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
        onNext={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
      />
    </div>
  )
}