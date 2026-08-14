import { Check, Loader2, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryItem, SaleProduct, CartItem } from "./pos";
import { formatRupiah } from "@/lib/helper";

type ProductCatalogProps = {
    filteredProducts: SaleProduct[];
    categoryList: CategoryItem[];
    selectedCategory: string;
    search: string;
    cart: CartItem[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    isLoading: boolean;

    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
    onAddToCart: (product: SaleProduct) => void;
};

export function ProductCatalog({
    filteredProducts,
    categoryList,
    selectedCategory,
    search,
    cart,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    onSearchChange,
    onCategoryChange,
    onPreviousPage,
    onNextPage,
    onAddToCart,
}: ProductCatalogProps) {
    return (
        <section className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Header */}
            <div className="space-y-4">


                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder="Cari produk atau SKU..."
                        className="h-11 pl-9"
                    />

                    {search && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                            onClick={() => onSearchChange("")}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>

                {/* Categories */}
                <Tabs
                    value={selectedCategory}
                    onValueChange={onCategoryChange}
                >
                    <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                        {categoryList.map((category) => (
                            <TabsTrigger
                                key={category.id}
                                value={category.id}
                                className="shrink-0 rounded-full border bg-background px-4"
                            >
                                {category.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
                <div className="space-y-4">
                    <div
                        className="
                            grid gap-3
                            grid-cols-2
                            sm:grid-cols-3
                            lg:grid-cols-3
                            xl:grid-cols-3
                            2xl:grid-cols-4
                        "
                    >
                        {filteredProducts.map((product) => {
                            const outOfStock =
                                product.stockQuantity <= 0;

                            const cartItem = cart.find(
                                (item) => item.id === product.id,
                            );

                            return (
                                <Card
                                    key={product.id}
                                    className="flex min-w-0 flex-col overflow-hidden"
                                >
                                    <CardHeader className="space-y-2 p-4 pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="max-w-full truncate"
                                            >
                                                {product.category}
                                            </Badge>

                                            <span
                                                className={`shrink-0 text-xs ${outOfStock
                                                    ? "text-destructive"
                                                    : "text-muted-foreground"
                                                    }`}
                                            >
                                                {outOfStock
                                                    ? "Habis"
                                                    : `Stok ${product.stockQuantity}`}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <h3
                                                className="truncate font-medium"
                                                title={product.name}
                                            >
                                                {product.name}
                                            </h3>

                                            <p
                                                className="truncate text-sm text-muted-foreground"
                                                title={product.variantName}
                                            >
                                                {product.variantName}
                                            </p>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 p-4 pt-2">
                                        <p className="text-lg font-semibold">
                                            {formatRupiah(
                                                product.sellingPrice,
                                            )}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                            SKU: {product.sku}
                                        </p>
                                    </CardContent>

                                    <CardFooter className="p-4 pt-0">
                                        <Button
                                            className="w-full"
                                            disabled={outOfStock}
                                            onClick={() =>
                                                onAddToCart(product)
                                            }
                                        >
                                            {cartItem ? (
                                                <>
                                                    <Check className="mr-2 size-4" />
                                                    {cartItem.quantity} di keranjang
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 size-4" />
                                                    Tambah
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-3 border-t pt-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {filteredProducts.length} dari {totalItems} produk
                        </p>

                        <div className="flex items-center gap-2">
                            {isLoading && (
                                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                    <Loader2 className="size-4 animate-spin" />
                                    Memuat...
                                </span>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onPreviousPage}
                                disabled={isLoading || currentPage === 1}
                            >
                                Previous
                            </Button>

                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onNextPage}
                                disabled={isLoading || currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed">
                    <div className="text-center">
                        <p className="font-medium">
                            Produk tidak ditemukan
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Coba ubah kata kunci atau kategori.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}