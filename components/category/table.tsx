"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { SelectCategory } from "@/db/schema"
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/categories"

import CategoryDialogForm from "./dialog-form"
import CategoryList from "./list"
import CategoryPagination from "./pagination"
import CategoryToolbar from "./toolbar"

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required."),
})

export type CategoryFormValues = z.infer<
  typeof categorySchema
>

type CategoryTableProps = {
  initialCategories: SelectCategory[]
}

export default function CategoryTable({
  initialCategories,
}: CategoryTableProps) {
  const [categories, setCategories] =
    useState<SelectCategory[]>(initialCategories)

  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [selectedCategory, setSelectedCategory] =
    useState<SelectCategory | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  })

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return categories
    }

    return categories.filter((category) =>
      category.name
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [categories, query])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / pageSize)
  )

  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pagedCategories = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize

    return filteredCategories.slice(
      startIndex,
      startIndex + pageSize
    )
  }, [filteredCategories, pageSize, safePage])

  const openCreateModal = () => {
    setSelectedCategory(null)

    form.reset({
      name: "",
    })

    setDialogOpen(true)
  }

  const openEditModal = (category: SelectCategory) => {
    setSelectedCategory(category)

    form.reset({
      name: category.name,
    })

    setDialogOpen(true)
  }

  const closeModal = () => {
    setDialogOpen(false)
    setSelectedCategory(null)

    form.reset({
      name: "",
    })
  }

  const handleSubmit = async (
    values: CategoryFormValues
  ) => {
    try {
      if (selectedCategory) {
        const updatedCategory = await updateCategory(
          selectedCategory.id,
          {
            name: values.name,
          }
        )

        setCategories((current) =>
          current.map((category) =>
            category.id === selectedCategory.id
              ? {
                  ...category,
                  name:
                    updatedCategory?.name ??
                    values.name,
                }
              : category
          )
        )

        toast.success("Category updated")
      } else {
        const createdCategory = await createCategory({
          name: values.name,
        })

        if (createdCategory) {
          setCategories((current) => [
            createdCategory,
            ...current,
          ])
        }

        toast.success("Category created")
      }

      closeModal()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save category."
      )
    }
  }

  const handleDelete = async (categoryId: string) => {
    const confirmed = window.confirm(
      "Delete this category?"
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteCategory(categoryId)

      setCategories((current) =>
        current.filter(
          (category) => category.id !== categoryId
        )
      )

      toast.success("Category deleted")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete category."
      )
    }
  }

  return (
    <div className="space-y-4 p-4">
      <CategoryToolbar
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
        <CategoryDialogForm
          form={form}
          selectedCategory={selectedCategory}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onClose={closeModal}
          onCreate={openCreateModal}
          onSubmit={handleSubmit}
        />
      </div>

      <CategoryList
        categories={pagedCategories}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <CategoryPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filteredCategories.length}
        currentItems={pagedCategories.length}
        onPrevious={() =>
          setPage((current) =>
            Math.max(current - 1, 1)
          )
        }
        onNext={() =>
          setPage((current) =>
            Math.min(current + 1, totalPages)
          )
        }
      />
    </div>
  )
}