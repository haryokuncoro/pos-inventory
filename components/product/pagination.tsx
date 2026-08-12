"use client"

import { Button } from "@/components/ui/button"

type ProductPaginationProps = {
    page: number
    totalPages: number
    totalItems: number
    currentItems: number

    onPrevious: () => void
    onNext: () => void
}

export default function ProductPagination({
    page,
    totalPages,
    totalItems,
    currentItems,
    onPrevious,
    onNext,
}: ProductPaginationProps) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {currentItems} of {totalItems}{" "}
                products
            </p>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    disabled={page === 1}
                >
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </span>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onNext}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
