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

import type { ProductRow } from "./table"

type ProductListProps = {
    products: ProductRow[]

    onEdit: (product: ProductRow) => void
    onDelete: (productId: string) => void
}

export default function ProductList({
    products,
    onEdit,
    onDelete,
}: ProductListProps) {
    return (
        <div className="overflow-hidden rounded-xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Variants</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-32 text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductRowItem
                                key={product.id}
                                product={product}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                        <EmptyProductRow />
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

type ProductRowItemProps = {
    product: ProductRow

    onEdit: (product: ProductRow) => void
    onDelete: (productId: string) => void
}

function ProductRowItem({
    product,
    onEdit,
    onDelete,
}: ProductRowItemProps) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                {product.name}
            </TableCell>

            <TableCell>
                {product.categoryName ?? "-"}
            </TableCell>

            <TableCell>
                {product.variants?.length
                    ? product.variants
                        .map((variant) => variant.sku)
                        .join(", ")
                    : "-"}
            </TableCell>

            <TableCell>
                {product.isActive ? "Active" : "Inactive"}
            </TableCell>

            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                    >
                        Edit
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                            onDelete(product.id)
                        }
                    >
                        Delete
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

function EmptyProductRow() {
    return (
        <TableRow>
            <TableCell
                colSpan={5}
                className="py-6 text-center text-sm text-muted-foreground"
            >
                No products found.
            </TableCell>
        </TableRow>
    )
}
