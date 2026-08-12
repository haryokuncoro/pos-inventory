import { Check, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryItem, SaleProduct, CartItem } from "./pos";
import { formatRupiah } from "@/lib/helper";

type ProductCatalogProps = {
    products: SaleProduct[];
    filteredProducts: SaleProduct[];
    categoryList: CategoryItem[];
    selectedCategory: string;
    search: string;
    cart: CartItem[];

    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onAddToCart: (product: SaleProduct) => void;
};

export function ProductCatalog({
    filteredProducts,
    categoryList,
    selectedCategory,
    search,
    cart,
    onSearchChange,
    onCategoryChange,
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
                <div
                    className="
                        grid gap-3
                        grid-cols-2
                        sm:grid-cols-3
                        lg:grid-cols-4
                        xl:grid-cols-5
                        2xl:grid-cols-6
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
                                            className={`shrink-0 text-xs ${
                                                outOfStock
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