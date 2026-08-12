"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type UserToolbarProps = {
    query: string
    pageSize: number

    onQueryChange: (value: string) => void
    onPageSizeChange: (value: number) => void
}

export default function UserToolbar({
    query,
    pageSize,
    onQueryChange,
    onPageSizeChange,
}: UserToolbarProps) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
                placeholder="Search by name or email"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                className="max-w-sm"
            />

            <div className="flex items-center gap-2 text-sm">
                <Label htmlFor="user-page-size" className="text-muted-foreground">
                    Rows
                </Label>

                <select
                    id="user-page-size"
                    value={pageSize}
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
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
