"use client";

import * as React from "react";
import type { CartContentProps } from "./cart-content";
import { Check, ShoppingCart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
} from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { createSale } from "@/lib/actions/sales";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { ProductCatalog } from "./product-catalog";
import { formatRupiah, parseAmount } from "@/lib/helper";
import { CartContent } from "./cart-content";

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

export type CartItem = SaleProduct & {
    quantity: number;
};

export type PaymentMethod =
    | "CASH"
    | "QRIS"
    | "CARD"
    | "TRANSFER";

export type CategoryItem = {
    id: string;
    label: string;
};

type PosPageProps = {
    products: SaleProduct[];
    categories?: string[];
    searchQuery: string;
    page: number;
    totalPages: number;
    totalItems: number;
};


// PAYMENT BUTTON
export type PaymentButtonProps = {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
};

export function PaymentButton({
    active,
    icon,
    label,
    onClick,
}: PaymentButtonProps) {
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


// POS PAGE

export function PosPage({
    products,
    categories = [],
    searchQuery,
    page,
    totalPages,
    totalItems,
}: PosPageProps) {
    // STATE

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = React.useTransition();

    const [search, setSearch] = React.useState(searchQuery);
    const [selectedCategory, setSelectedCategory] =
        React.useState("ALL");

    const [cart, setCart] = React.useState<CartItem[]>(
        [],
    );

    const [paymentMethod, setPaymentMethod] =
        React.useState<PaymentMethod>("CASH");

    const [cashReceivedInput, setCashReceivedInput] =
        React.useState("");

    const [cartOpen, setCartOpen] =
        React.useState(false);

    const [isSubmitting, setIsSubmitting] =
        React.useState(false);

    // CATEGORIES

    const categoryList = React.useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(
                categories.length > 0
                    ? categories
                    : products.map(
                        (product) =>
                            product.category,
                    ),
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
    React.useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    const filteredProducts = React.useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === "ALL" ||
                product.category ===
                selectedCategory;
            return matchesCategory;
        });
    }, [
        products,
        selectedCategory,
    ]);

    const safePage = Math.min(
        Math.max(page, 1),
        Math.max(totalPages, 1),
    );

    const updateCatalogParams = React.useCallback((nextQuery: string, nextPage: number) => {
        const params = new URLSearchParams(
            searchParams.toString(),
        );

        const normalizedQuery = nextQuery.trim();

        if (normalizedQuery) {
            params.set("query", normalizedQuery);
        } else {
            params.delete("query");
        }

        if (nextPage > 1) {
            params.set("page", String(nextPage));
        } else {
            params.delete("page");
        }

        startTransition(() => {
            router.replace(
                `${pathname}?${params.toString()}`,
                {
                    scroll: false,
                },
            );
        });
    }, [pathname, router, searchParams, startTransition]);

    React.useEffect(() => {
        const searchTimeout = setTimeout(() => {
            if (search.trim() === searchQuery.trim()) {
                return;
            }

            updateCatalogParams(search, 1);
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [search, searchQuery, updateCatalogParams]);

    function handleSearchChange(value: string) {
        setSearch(value);
    }

    function handleCategoryChange(value: string) {
        setSelectedCategory(value);
    }

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
                        quantity:
                            item.quantity + 1,
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
                            quantity:
                                item.quantity - 1,
                        }
                        : item,
                )
                .filter(
                    (item) => item.quantity > 0,
                ),
        );
    }

    function removeFromCart(id: string) {
        setCart((current) =>
            current.filter(
                (item) => item.id !== id,
            ),
        );
    }

    function clearCart() {
        setCart([]);
        setCashReceivedInput("");
    }

    // CHECKOUT

    async function handleCheckout() {
        if (cart.length === 0) {
            return;
        }

        if (paymentMethod === "CASH") {
            if (cashReceived < total) {
                toast.error(
                    "Uang bayar kurang dari total belanja.",
                );
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const session =
                await authClient.getSession();

            const cashierId =
                session.data?.user?.id;

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

            toast.success(
                `Transaksi berhasil: ${result.invoiceNumber}`,
            );

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
    const totalCartItems = cart.reduce(
        (sum, item) =>
            sum + item.quantity,
        0,
    );

    const subtotal = cart.reduce(
        (sum, item) =>
            sum +
            item.sellingPrice *
            item.quantity,
        0,
    );

    const discount = 0;
    const tax = 0;

    const total =
        subtotal - discount + tax;

    const cashReceived =
        parseAmount(cashReceivedInput);

    const changeAmount = Math.max(
        cashReceived - total,
        0,
    );

    // SHARED CART PROPS
    const cartContentProps: CartContentProps = {
        cart,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        cashReceivedInput,
        cashReceived,
        changeAmount,
        isSubmitting,

        onPaymentMethodChange:
            setPaymentMethod,

        onCashReceivedChange:
            setCashReceivedInput,

        onIncreaseQuantity:
            increaseQuantity,

        onDecreaseQuantity:
            decreaseQuantity,

        onRemoveFromCart:
            removeFromCart,

        onClearCart: clearCart,

        onCheckout: handleCheckout,
    };

    // RETURN

    return (
        <div className="flex min-h-full flex-col gap-4 p-4 lg:p-6">
            {/* Mobile / Tablet Cart */}
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
                                {totalCartItems} item ·{" "}
                                {formatRupiah(
                                    total,
                                )}
                            </p>
                        </div>
                    </div>

                    <Sheet
                        open={cartOpen}
                        onOpenChange={setCartOpen}
                    >
                        <SheetTrigger
                            render={
                                <Button>
                                    Lihat keranjang
                                </Button>
                            }
                        />

                        <SheetContent
                            side="right"
                            className="flex w-full flex-col p-0 sm:max-w-md"
                        >
                            <SheetHeader className="border-b px-4 py-4">
                                <SheetTitle>
                                    Keranjang
                                </SheetTitle>
                            </SheetHeader>

                            <CartContent
                                {...cartContentProps}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Main */}
            <div className="flex min-h-0 flex-1 gap-6">
                <ProductCatalog
                    filteredProducts={filteredProducts}
                    categoryList={categoryList}
                    selectedCategory={
                        selectedCategory
                    }
                    search={search}
                    cart={cart}
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    isLoading={isPending}
                    onSearchChange={
                        handleSearchChange
                    }
                    onCategoryChange={
                        handleCategoryChange
                    }
                    onPreviousPage={() =>
                        updateCatalogParams(
                            search,
                            Math.max(
                                safePage - 1,
                                1,
                            ),
                        )
                    }
                    onNextPage={() =>
                        updateCatalogParams(
                            search,
                            Math.min(
                                safePage + 1,
                                totalPages,
                            ),
                        )
                    }
                    onAddToCart={addToCart}
                />

                {/* Desktop Cart */}
                <aside className="hidden w-[380px] shrink-0 xl:flex">
                    <Card className="sticky top-4 flex h-[calc(100vh-2rem)] max-h-[850px] w-full flex-col">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold">
                                        Keranjang
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        {totalCartItems}{" "}
                                        item
                                    </p>
                                </div>

                                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                    <ShoppingCart className="size-5" />
                                </div>
                            </div>
                        </CardHeader>

                        <CartContent
                            {...cartContentProps}
                        />
                    </Card>
                </aside>
            </div>
        </div>
    );
}