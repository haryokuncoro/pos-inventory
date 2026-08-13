import { notFound } from "next/navigation";

import { Receipt } from "@/components/sales/receipt";
import { getSaleById } from "@/lib/actions/sales-receipt";

type ReceiptPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ReceiptPage({ params }: ReceiptPageProps) {
    const { id } = await params;
    const transaction = await getSaleById(id);

    if (!transaction) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white p-4 text-black">
            <Receipt transaction={transaction} />
        </main>
    );
}