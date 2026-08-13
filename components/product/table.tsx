"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { SelectCategory, SelectProduct } from "@/db/schema"
import {
  createProduct,
  deleteProduct,
  getProductsPaginated,
  updateProduct,
  type PaginatedProductsResult,
} from "@/lib/actions/products"

import ProductDialogForm from "./dialog-form"
import ProductList from "./list"
import ProductToolbar from "./toolbar"
import GeneralPagination from "@/components/dashboard/pagination"
import { ImportProductsDialog } from "./import"
import { authClient } from "@/lib/auth-client"

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "SKU is required."),
  name: z.string().trim().min(1, "Variant name is required."),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative."),
  costPrice: z.string().trim().min(1, "Cost price is required."),
  sellingPrice: z.string().trim().min(1, "Selling price is required."),
  isActive: z.boolean().default(true),
})

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  categoryId: z.string().min(1, "Please select a category."),
  description: z.string(),
  isActive: z.boolean(),
  variants: z.array(variantSchema).min(1, "At least one variant is required."),
})

export type ProductVariantFormValues = z.infer<typeof variantSchema>

export type ProductFormValues = z.infer<typeof productSchema>

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

const defaultVariant: ProductVariantFormValues = {
  sku: "",
  name: "",
  stockQuantity: 0,
  costPrice: "",
  sellingPrice: "",
  isActive: true,
}

const defaultValues: ProductFormValues = {
  name: "",
  categoryId: "",
  description: "",
  isActive: true,
  variants: [{ ...defaultVariant }],
}

export default function ProductTable({ initialProducts, initialCategories }: ProductTableProps) {
  const { data: session } = authClient.useSession()
  const [products, setProducts] = useState<ProductRow[]>(initialProducts.items)
  const [categories] = useState<SelectCategory[]>(initialCategories)

  const [query, setQuery] = useState("")
  const [page, setPage] = useState(initialProducts.page)
  const [pageSize, setPageSize] = useState(initialProducts.pageSize)
  const [totalItems, setTotalItems] = useState(initialProducts.totalItems)
  const [totalPages, setTotalPages] = useState(initialProducts.totalPages)
  const [isPending, startTransition] = useTransition()
  const initialLoadCompletedRef = useRef(false)

  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as never,
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  })

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

  const resetModal = () => {
    setDialogOpen(false)
    setSelectedProduct(null)

    form.reset(defaultValues)
  }

  const openCreateModal = () => {
    setSelectedProduct(null)

    form.reset(defaultValues)

    setDialogOpen(true)
  }

  const openEditModal = (product: ProductRow) => {
    setSelectedProduct(product)

    const selectedVariants = product.variants?.length
      ? product.variants
      : [{ ...defaultVariant }]

    form.reset({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description ?? "",
      isActive: product.isActive,
      variants: selectedVariants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        name: variant.name,
        stockQuantity: variant.stockQuantity,
        costPrice: variant.costPrice,
        sellingPrice: variant.sellingPrice,
        isActive: variant.isActive,
      })),
    })

    setDialogOpen(true)
  }

  const handleSubmit = async (values: ProductFormValues) => {
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
        await updateProduct(
          selectedProduct.id,
          {
            name: values.name,
            categoryId: values.categoryId,
            description: values.description || null,
            isActive: values.isActive,
          },
          variantsPayload,
        )

        await fetchProducts()

        toast.success("Product updated")
      } else {
        await createProduct(
          {
            name: values.name,
            categoryId: values.categoryId,
            description: values.description || null,
            isActive: values.isActive,
          },
          variantsPayload,
        )

        if (page !== 1) {
          setPage(1)
        } else {
          await fetchProducts(1, pageSize, query)
        }

        toast.success("Product created")
      }

      resetModal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save product.")
    }
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
        <ProductDialogForm
          form={form}
          variantFields={fields}
          selectedProduct={selectedProduct}
          categories={categories}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onClose={resetModal}
          onCreate={openCreateModal}
          onSubmit={handleSubmit}
          onAppendVariant={() => append({ ...defaultVariant })}
          onRemoveVariant={remove}
        />
      </div>

       <ImportProductsDialog
                userId={session?.user.id ?? ""}
                onSuccess={fetchProducts}
              />

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
