"use client";

import * as React from "react";
import {
    Banknote,
    Check,
    CreditCard,
    Minus,
    Plus,
    QrCode,
    Search,
    ShoppingCart,
    Trash2,
    WalletCards,
    X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { createSale } from "@/lib/actions/sales";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

// TYPES
export type SaleProduct = {
    id: string;
    name: string;
    variantName: string;
    sku: string;
    category: string;
    sellingPrice: number;
    stockQuantity: number;
};

type CartItem = SaleProduct & {
    quantity: number;
};

type PaymentMethod =
    | "CASH"
    | "QRIS"
    | "CARD"
    | "TRANSFER";

// HELPERS

function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

// PROPS

type PosPageProps = {
    products: SaleProduct[];
    categories?: string[];
};

// PAGE
export function PosPage({
    products,
    categories = [],
}: PosPageProps) {
    const [search, setSearch] = React.useState("");
    const [selectedCategory, setSelectedCategory] =
        React.useState("ALL");

    const [cart, setCart] = React.useState<CartItem[]>([]);

    const [paymentMethod, setPaymentMethod] =
        React.useState<PaymentMethod>("CASH");

    const [cartOpen, setCartOpen] =
        React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // CATEGORIES

    const categoryList = React.useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(
                categories.length > 0
                    ? categories
                    : products.map((product) => product.category),
            ),
        );

        return [
            {
                id: "ALL",
                label: "Semua",
            },
            ...uniqueCategories.map((category) => ({
                id: category,
                label: category,
            })),
        ];
    }, [categories, products]);

    // FILTER PRODUCTS

    const filteredProducts = React.useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === "ALL" ||
                product.category === selectedCategory;

            if (!keyword) {
                return matchesCategory;
            }

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(keyword) ||
                product.variantName
                    .toLowerCase()
                    .includes(keyword) ||
                product.sku
                    .toLowerCase()
                    .includes(keyword);

            return matchesCategory && matchesSearch;
        });
    }, [products, search, selectedCategory]);

    // CART

    function addToCart(product: SaleProduct) {
        if (product.stockQuantity <= 0) {
            return;
        }

        setCart((current) => {
            const existing = current.find(
                (item) => item.id === product.id,
            );

            if (!existing) {
                return [
                    ...current,
                    {
                        ...product,
                        quantity: 1,
                    },
                ];
            }

            if (
                existing.quantity >=
                product.stockQuantity
            ) {
                return current;
            }

            return current.map((item) =>
                item.id === product.id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item,
            );
        });
    }

    function increaseQuantity(id: string) {
        setCart((current) =>
            current.map((item) => {
                if (item.id !== id) {
                    return item;
                }

                if (
                    item.quantity >=
                    item.stockQuantity
                ) {
                    return item;
                }

                return {
                    ...item,
                    quantity: item.quantity + 1,
                };
            }),
        );
    }

    function decreaseQuantity(id: string) {
        setCart((current) =>
            current
                .map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            quantity: item.quantity - 1,
                        }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    }

    function removeFromCart(id: string) {
        setCart((current) =>
            current.filter((item) => item.id !== id),
        );
    }

    function clearCart() {
        setCart([]);
    }

    async function handleCheckout() {
        if (cart.length === 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const session = await authClient.getSession();
            const cashierId = session.data?.user?.id;

            const result = await createSale({
                cashierId,
                items: cart.map((item) => ({
                    variantId: item.id,
                    quantity: item.quantity,
                })),
                payment: {
                    method: paymentMethod,
                    amount: total,
                },
            });

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            toast.success(`Transaksi berhasil: ${result.invoiceNumber}`);
            clearCart();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Gagal membuat transaksi.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    // TOTALS

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    const subtotal = cart.reduce(
        (sum, item) =>
            sum + item.sellingPrice * item.quantity,
        0,
    );

    const discount = 0;
    const tax = 0;
    const total =
        subtotal - discount + tax;

    // PRODUCT CATALOG

    function ProductCatalog() {
        return (
            <section className="flex min-w-0 flex-1 flex-col gap-4">
                {/* Header */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Penjualan
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Pilih produk untuk membuat transaksi.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
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
                                onClick={() => setSearch("")}
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>

                    {/* Categories */}
                    <Tabs
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
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
                                                addToCart(product)
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

    // ----------------------------------------------------------
    // CART CONTENT
    // ----------------------------------------------------------

    function CartContent() {
        return (
            <div className="flex min-h-0 flex-1 flex-col">
                {/* Cart items */}
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                                <ShoppingCart className="size-6 text-muted-foreground" />
                            </div>

                            <p className="mt-4 font-medium">
                                Keranjang kosong
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Tambahkan produk ke transaksi.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {item.name}
                                            </p>

                                            <p className="truncate text-sm text-muted-foreground">
                                                {item.variantName}
                                            </p>
                                        </div>

                                        <p className="shrink-0 font-medium">
                                            {formatRupiah(
                                                item.sellingPrice *
                                                item.quantity,
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center rounded-md border">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() =>
                                                    decreaseQuantity(
                                                        item.id,
                                                    )
                                                }
                                            >
                                                <Minus className="size-3.5" />
                                            </Button>

                                            <span className="w-9 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                disabled={
                                                    item.quantity >=
                                                    item.stockQuantity
                                                }
                                                onClick={() =>
                                                    increaseQuantity(
                                                        item.id,
                                                    )
                                                }
                                            >
                                                <Plus className="size-3.5" />
                                            </Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>

                                    <Separator />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="space-y-4 border-t p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>

                            <span>
                                {formatRupiah(subtotal)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Diskon
                            </span>

                            <span>
                                {formatRupiah(discount)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Pajak
                            </span>

                            <span>
                                {formatRupiah(tax)}
                            </span>
                        </div>

                        <Separator />

                        <div className="flex items-end justify-between gap-4">
                            <span className="font-semibold">
                                Total
                            </span>

                            <span className="text-2xl font-bold">
                                {formatRupiah(total)}
                            </span>
                        </div>
                    </div>

                    {/* Payment method */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Pembayaran
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            <PaymentButton
                                active={
                                    paymentMethod === "CASH"
                                }
                                icon={<Banknote />}
                                label="Tunai"
                                onClick={() =>
                                    setPaymentMethod("CASH")
                                }
                            />

                            <PaymentButton
                                active={
                                    paymentMethod === "QRIS"
                                }
                                icon={<QrCode />}
                                label="QRIS"
                                onClick={() =>
                                    setPaymentMethod("QRIS")
                                }
                            />

                            <PaymentButton
                                active={
                                    paymentMethod === "CARD"
                                }
                                icon={<CreditCard />}
                                label="Kartu"
                                onClick={() =>
                                    setPaymentMethod("CARD")
                                }
                            />

                            <PaymentButton
                                active={
                                    paymentMethod === "TRANSFER"
                                }
                                icon={<WalletCards />}
                                label="Transfer"
                                onClick={() =>
                                    setPaymentMethod("TRANSFER")
                                }
                            />
                        </div>
                    </div>

                    <Button
                        className="h-12 w-full text-base"
                        disabled={cart.length === 0 || isSubmitting}
                        onClick={handleCheckout}
                    >
                        {isSubmitting ? "Memproses..." : `Bayar ${formatRupiah(total)}`}
                    </Button>

                    {cart.length > 0 && (
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground"
                            onClick={clearCart}
                        >
                            Kosongkan keranjang
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // RETURN

    return (
        <div className="flex min-h-full flex-col gap-4 p-4 lg:p-6">
            {
            /* =====================================================
          TABLET / MOBILE CART BAR
          Hidden on XL because desktop has sidebar.
          ===================================================== */}

            <div className="xl:hidden">
                <div className="flex items-center justify-between rounded-xl border bg-card p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                            <ShoppingCart className="size-5" />
                        </div>

                        <div>
                            <p className="font-medium">
                                Keranjang
                            </p>

                            <p className="text-sm text-muted-foreground">
                                {totalItems} item ·{" "}
                                {formatRupiah(total)}
                            </p>
                        </div>
                    </div>

                    <Sheet
                        open={cartOpen}
                        onOpenChange={setCartOpen}
                    >
                        <SheetTrigger render={<Button>Lihat keranjang</Button>} />

                        <SheetContent
                            side="right"
                            className="flex w-full flex-col p-0 sm:max-w-md"
                        >
                            <SheetHeader className="border-b px-4 py-4">
                                <SheetTitle>
                                    Keranjang
                                </SheetTitle>
                            </SheetHeader>

                            <CartContent />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {
            /* =====================================================
          MAIN
          ===================================================== */}

            <div className="flex min-h-0 flex-1 gap-6">
                {/* Product catalog */}
                <ProductCatalog />

                {/* ===================================================
            DESKTOP CART
            =================================================== */}

                <aside className="hidden w-[380px] shrink-0 xl:flex">
                    <Card className="sticky top-4 flex h-[calc(100vh-2rem)] max-h-[850px] w-full flex-col">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold">
                                        Keranjang
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        {totalItems} item
                                    </p>
                                </div>

                                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                    <ShoppingCart className="size-5" />
                                </div>
                            </div>
                        </CardHeader>

                        <CartContent />
                    </Card>
                </aside>
            </div>
        </div>
    );
}

// PAYMENT BUTTON

function PaymentButton({
    active,
    icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant={active ? "default" : "outline"}
            className="justify-start"
            onClick={onClick}
        >
            <span className="[&_svg]:size-4">
                {icon}
            </span>

            <span className="ml-2">{label}</span>

            {active && (
                <Check className="ml-auto size-4" />
            )}
        </Button>
    );
}
