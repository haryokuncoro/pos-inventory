import { StoreSettingsForm } from "@/components/store-settings/form"
import { getStoreSettings } from "@/lib/actions/store-settings";

export default async function StoreSettingsHome() {

  const { store, settings } = await getStoreSettings();
  const initialData = {
    storeId: store?.id ?? "",
    storeSettingsId: settings?.id ?? "",
    name: store?.name ?? "My Store",
    code: store?.code ?? "STORE-001",
    address: store?.address ?? "",
    phone: store?.phone ?? "",
    email: store?.email ?? "",
    logoUrl: store?.logoUrl ?? "",

    receiptHeader: settings?.receiptHeader ?? "",
    receiptFooter: settings?.receiptFooter ?? "",

    taxEnabled: settings?.taxEnabled ?? false,
    taxRate: settings?.taxRate ?? "0",

    currency: settings?.currency ?? "IDR",
    timezone: settings?.timezone ?? "Asia/Jakarta",

    allowNegativeStock: settings?.allowNegativeStock ?? false,
  }

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <StoreSettingsForm initialData={initialData} />
    </div>
  )
}