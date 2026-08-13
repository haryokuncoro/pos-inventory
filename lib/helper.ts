export async function withErrorHandling<T>(
  action: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Error ${action}:`, error);
    throw new Error(`Failed ${action}`);
  }
}

export function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export function parseAmount(value: string) {
    const normalized = value.replace(/,/g, ".").trim();

    if (!normalized) {
        return 0;
    }

    const amount = Number(normalized);

    return Number.isFinite(amount) ? amount : 0;
}

export function generateSku(
  productName: string,
  variantName: string
): string {
  const normalize = (value: string) =>
    value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

  const product = normalize(productName)
  const variant = normalize(variantName)

  if (!product && !variant) {
    return ""
  }

  if (!variant) {
    return product
  }

  if (!product) {
    return variant
  }

  return `${product}-${variant}`
}

