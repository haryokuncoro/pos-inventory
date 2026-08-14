import { formatRupiah } from "@/lib/helper";
import type { SelectStore, SelectStoreSettings } from "@/db/schema";
export type ReceiptTransaction = {
    invoiceNumber: string;
    createdAt: Date;
    subtotal: string;
    discountAmount: string;
    taxAmount: string;
    totalAmount: string;
    items: Array<{
        id: string;
        productName: string;
        quantity: number;
        unitPrice: string;
    }>;
    payments: Array<{
        method: "CASH" | "QRIS" | "CARD" | "TRANSFER";
        amount: string;
    }>;
};

type ReceiptProps = {
    transaction: ReceiptTransaction;
    store: SelectStore | null;
    settings: SelectStoreSettings | null;
};

export function Receipt({ transaction, store, settings }: ReceiptProps) {
    return (
        <div className="receipt">
            <div className="text-center">
                {settings?.receiptHeader && <p>{settings.receiptHeader}</p>}

                <h1 className="font-bold text-lg">
                    {!settings?.receiptHeader ? (store?.name ?? "TOKO ABC") : null}
                </h1>

                <p>{store?.address ?? "Jl. Contoh No. 123"}</p>
                <p>{store?.phone ?? "Telp. 08123456789"}</p>
            </div>

            <div className="divider" />

            <div className="text-xs">
                <div className="flex justify-between">
                    <span>No.</span>
                    <span>
                        {transaction.invoiceNumber}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Tanggal</span>
                    <span>
                        {new Date(
                            transaction.createdAt,
                        ).toLocaleString("id-ID")}
                    </span>
                </div>
            </div>

            <div className="divider" />

            <div className="space-y-2">
                {transaction.items.map((item) => (
                    <div key={item.id}>
                        <div>{item.productName}</div>

                        <div className="flex justify-between">
                            <span>
                                {item.quantity} x{" "}
                                {formatRupiah(Number(item.unitPrice))}
                            </span>

                            <span>
                                {formatRupiah(
                                    item.quantity * Number(item.unitPrice),
                                )}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="divider" />

            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                        {formatRupiah(
                            Number(transaction.subtotal),
                        )}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Diskon</span>
                    <span>
                        {formatRupiah(
                            Number(transaction.discountAmount),
                        )}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>
                        {formatRupiah(Number(transaction.taxAmount))}
                    </span>
                </div>

                <div className="flex justify-between font-bold">
                    <span>TOTAL</span>
                    <span>
                        {formatRupiah(Number(transaction.totalAmount))}
                    </span>
                </div>
            </div>

            <div className="divider" />

            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Pembayaran</span>
                    <span>
                        {transaction.payments[0]?.method ?? "-"}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Nominal Bayar</span>
                    <span>
                        {formatRupiah(
                            Number(transaction.payments[0]?.amount ?? 0),
                        )}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Kembalian</span>
                    <span>
                        {formatRupiah(
                            Math.max(
                                Number(transaction.payments[0]?.amount ?? 0) -
                                Number(transaction.totalAmount),
                                0,
                            )
                        )}
                    </span>
                </div>
            </div>

            <div className="divider" />

            <div className="mt-4 text-center">
                <p>{settings?.receiptFooter ?? "Terima kasih"}</p>
            </div>
        </div>
    );
}