"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CategoryToolbarProps = {
  query: string
  pageSize: number

  onQueryChange: (value: string) => void
  onPageSizeChange: (value: number) => void
}

export default function CategoryToolbar({
  query,
  pageSize,
  onQueryChange,
  onPageSizeChange,
}: CategoryToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Input
        placeholder="Search by name"
        value={query}
        onChange={(event) =>
          onQueryChange(event.target.value)
        }
        className="max-w-sm"
      />

      <div className="flex items-center gap-2 text-sm">
        <Label
          htmlFor="category-page-size"
          className="text-muted-foreground"
        >
          Rows
        </Label>

        <select
          id="category-page-size"
          value={pageSize}
          onChange={(event) =>
            onPageSizeChange(
              Number(event.target.value)
            )
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>
      </div>
    </div>
  )
}