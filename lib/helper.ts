
function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

function parseAmount(value: string) {
    const normalized = value.replace(/,/g, ".").trim();

    if (!normalized) {
        return 0;
    }

    const amount = Number(normalized);

    return Number.isFinite(amount) ? amount : 0;
}

export { formatRupiah, parseAmount };