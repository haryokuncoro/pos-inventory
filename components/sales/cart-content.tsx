import { Button } from "@/components/ui/button";
import {
    Banknote,
    CreditCard,
    Minus,
    Plus,
    QrCode,
    ShoppingCart,
    Trash2,
    WalletCards,
} from "lucide-react";
import { formatRupiah } from "@/lib/helper";
import { CartItem, PaymentMethod, PaymentButton, DiscountType } from "./pos";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import * as React from "react";

export type CartContentProps = {
    cart: CartItem[];

    subtotal: number;
    discount: number;
    tax: number;
    total: number;

    paymentMethod: PaymentMethod;
    cashReceivedInput: string;
    cashReceived: number;
    changeAmount: number;

    discountType: DiscountType;
    discountValueInput: string;

    taxValueInput: string;

    isSubmitting: boolean;

    transactionId?: string | null;

    onPaymentMethodChange: (
        method: PaymentMethod,
    ) => void;

    onCashReceivedChange: (
        value: string,
    ) => void;

    onDiscountTypeChange: (
        type: DiscountType,
    ) => void;

    onDiscountValueChange: (
        value: string,
    ) => void;

    onTaxValueChange: (
        value: string,
    ) => void;

    onIncreaseQuantity: (id: string) => void;
    onDecreaseQuantity: (id: string) => void;
    onRemoveFromCart: (id: string) => void;
    onClearCart: () => void;

    onCheckout: () => void;

    onPrintReceipt: (transactionId: string) => void;

    onNewTransaction: () => void;
};

export function CartContent({
    cart,
    subtotal,
    discount,
    tax,
    total,
    paymentMethod,
    cashReceivedInput,
    cashReceived,
    changeAmount,
    discountType,
    discountValueInput,
    taxValueInput,
    isSubmitting,
    transactionId,
    onPaymentMethodChange,
    onCashReceivedChange,
    onDiscountTypeChange,
    onDiscountValueChange,
    onTaxValueChange,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveFromCart,
    onClearCart,
    onCheckout,
    onPrintReceipt,
    onNewTransaction,
}: CartContentProps) {
    const paymentSuccess = Boolean(transactionId);
    const [showDiscountInput, setShowDiscountInput] =
        React.useState(false);
    const [showTaxInput, setShowTaxInput] = React.useState(false);

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
                                                onDecreaseQuantity(
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
                                                onIncreaseQuantity(
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
                                            onRemoveFromCart(
                                                item.id,
                                            )
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

                {/* Discount */}
                {!paymentSuccess && (
                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-center"
                            onClick={() =>
                                setShowDiscountInput((visible) => !visible)
                            }
                        >
                            {showDiscountInput ? "Sembunyikan diskon" : "Tambah diskon"}
                        </Button>

                        {showDiscountInput && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant={
                                            discountType === "FIXED"
                                                ? "default"
                                                : "outline"
                                        }
                                        className="justify-center"
                                        onClick={() =>
                                            onDiscountTypeChange("FIXED")
                                        }
                                    >
                                        Nominal
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={
                                            discountType === "PERCENTAGE"
                                                ? "default"
                                                : "outline"
                                        }
                                        className="justify-center"
                                        onClick={() =>
                                            onDiscountTypeChange("PERCENTAGE")
                                        }
                                    >
                                        Persen (%)
                                    </Button>
                                </div>

                                <Input
                                    type="number"
                                    min={0}
                                    max={
                                        discountType === "PERCENTAGE"
                                            ? 100
                                            : undefined
                                    }
                                    step={
                                        discountType === "PERCENTAGE"
                                            ? "1"
                                            : "1000"
                                    }
                                    inputMode="numeric"
                                    placeholder={
                                        discountType === "PERCENTAGE"
                                            ? "Masukkan persen diskon"
                                            : "Masukkan nominal diskon"
                                    }
                                    value={discountValueInput}
                                    onChange={(event) =>
                                        onDiscountValueChange(event.target.value)
                                    }
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Tax */}
                {!paymentSuccess && (
                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-center"
                            onClick={() =>
                                setShowTaxInput((visible) => !visible)
                            }
                        >
                            {showTaxInput ? "Sembunyikan pajak" : "Tambah pajak"}
                        </Button>

                        {showTaxInput && (
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                step="1"
                                inputMode="numeric"
                                placeholder="Masukkan persen pajak"
                                value={taxValueInput}
                                onChange={(event) =>
                                    onTaxValueChange(event.target.value)
                                }
                            />
                        )}
                    </div>
                )}

                {/* Payment method */}
                {!paymentSuccess && (
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
                                    onPaymentMethodChange(
                                        "CASH",
                                    )
                                }
                            />

                            <PaymentButton
                                active={
                                    paymentMethod === "QRIS"
                                }
                                icon={<QrCode />}
                                label="QRIS"
                                onClick={() =>
                                    onPaymentMethodChange(
                                        "QRIS",
                                    )
                                }
                            />

                            <PaymentButton
                                active={
                                    paymentMethod === "CARD"
                                }
                                icon={<CreditCard />}
                                label="Kartu"
                                onClick={() =>
                                    onPaymentMethodChange(
                                        "CARD",
                                    )
                                }
                            />

                            <PaymentButton
                                active={
                                    paymentMethod ===
                                    "TRANSFER"
                                }
                                icon={<WalletCards />}
                                label="Transfer"
                                onClick={() =>
                                    onPaymentMethodChange(
                                        "TRANSFER",
                                    )
                                }
                            />
                        </div>

                        {paymentMethod === "CASH" && (
                            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="cash-received"
                                        className="text-sm font-medium"
                                    >
                                        Uang pelanggan
                                    </label>

                                    <Input
                                        id="cash-received"
                                        type="number"
                                        min={
                                            total > 0
                                                ? total
                                                : 0
                                        }
                                        step="1000"
                                        inputMode="numeric"
                                        placeholder="Masukkan nominal bayar"
                                        value={
                                            cashReceivedInput
                                        }
                                        onChange={(event) =>
                                            onCashReceivedChange(
                                                event.target
                                                    .value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Kembalian
                                    </span>

                                    <span className="font-medium">
                                        {formatRupiah(
                                            changeAmount,
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Payment button */}
                {!paymentSuccess && (
                    <>
                        <Button
                            className="h-12 w-full text-base"
                            disabled={
                                cart.length === 0 ||
                                isSubmitting ||
                                (paymentMethod === "CASH" &&
                                    cashReceived < total)
                            }
                            onClick={onCheckout}
                        >
                            {isSubmitting
                                ? "Memproses..."
                                : `Bayar ${formatRupiah(total)}`}
                        </Button>

                        {cart.length > 0 && (
                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground"
                                onClick={onClearCart}
                            >
                                Kosongkan keranjang
                            </Button>
                        )}
                    </>
                )}

                {/* Payment success */}
                {paymentSuccess && transactionId && (
                    <div className="space-y-3">
                        <div className="rounded-lg border bg-muted/30 p-4 text-center">
                            <p className="font-semibold">
                                Pembayaran berhasil
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Transaksi #{transactionId}
                            </p>
                        </div>

                        <Button
                            className="h-12 w-full"
                            onClick={() =>
                                onPrintReceipt(transactionId)
                            }
                        >
                            Cetak Struk
                        </Button>

                        <Button
                            variant="outline"
                            className="h-12 w-full"
                            onClick={onNewTransaction}
                        >
                            Transaksi Baru
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}