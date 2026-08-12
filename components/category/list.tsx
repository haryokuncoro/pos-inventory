"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { SelectCategory } from "@/db/schema"

type CategoryListProps = {
  categories: SelectCategory[]

  onEdit: (category: SelectCategory) => void
  onDelete: (categoryId: string) => void
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>

            <TableHead className="w-32 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.length > 0 ? (
            categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <EmptyCategoryRow />
          )}
        </TableBody>
      </Table>
    </div>
  )
}

type CategoryRowProps = {
  category: SelectCategory

  onEdit: (category: SelectCategory) => void
  onDelete: (categoryId: string) => void
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {category.name}
      </TableCell>

      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
          >
            Edit
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() =>
              onDelete(category.id)
            }
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function EmptyCategoryRow() {
  return (
    <TableRow>
      <TableCell
        colSpan={2}
        className="py-6 text-center text-sm text-muted-foreground"
      >
        No categories found.
      </TableCell>
    </TableRow>
  )
}