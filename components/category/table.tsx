"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
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
import type { SelectCategory } from "@/db/schema"
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/categories"

type CategoryTableProps = {
  initialCategories: SelectCategory[]
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export function CategoryTable({ initialCategories }: CategoryTableProps) {
  const [categories, setCategories] = useState<SelectCategory[]>(initialCategories)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [selectedCategory, setSelectedCategory] = useState<SelectCategory | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  })

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return categories
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery)
    )
  }, [categories, query])

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pagedCategories = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize
    return filteredCategories.slice(startIndex, startIndex + pageSize)
  }, [filteredCategories, pageSize, safePage])

  const resetModal = () => {
    setDialogOpen(false)
    setSelectedCategory(null)
    reset({ name: "" })
  }

  const openCreateModal = () => {
    setSelectedCategory(null)
    reset({ name: "" })
    setDialogOpen(true)
  }

  const openEditModal = (category: SelectCategory) => {
    setSelectedCategory(category)
    reset({ name: category.name })
    setDialogOpen(true)
  }

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (selectedCategory) {
        const updatedCategory = await updateCategory(selectedCategory.id, {
          name: values.name,
        })

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === selectedCategory.id
              ? { ...category, name: updatedCategory?.name ?? values.name }
              : category
          )
        )
        toast.success("Category updated")
      } else {
        const createdCategory = await createCategory({ name: values.name })

        if (createdCategory) {
          setCategories((currentCategories) => [createdCategory, ...currentCategories])
        }
        toast.success("Category created")
      }

      resetModal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save category.")
    }
  }

  const handleDelete = async (categoryId: string) => {
    const confirmed = window.confirm("Delete this category?")
    if (!confirmed) {
      return
    }

    try {
      await deleteCategory(categoryId)
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId)
      )
      toast.success("Category deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete category.")
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product categories with search, pagination, and quick updates.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search by name"
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
              <TableHead>Name</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedCategories.length > 0 ? (
              pagedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(category)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {pagedCategories.length} of {filteredCategories.length} categories
        </p>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))} disabled={safePage === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))} disabled={safePage === totalPages}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          resetModal()
        }
      }}>
        <DialogTrigger
          render={<Button onClick={openCreateModal}>Add category</Button>}
        />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Update category" : "Create category"}</DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update the category name below."
                : "Create a new product category for your inventory."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Category name is required." }}
                render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <Input
                      id="category-name"
                      placeholder="Enter category name"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.error ? (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    ) : null}
                  </div>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : selectedCategory ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
