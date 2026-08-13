import { StoreSettingsForm } from "@/components/store-settings/form"

export default async function StoreSettingsHome() {
  // TODO:
  // Ambil store + store_settings dari database

  const initialData = {
    name: "My Store",
    code: "STORE-001",
    address: "",
    phone: "",
    email: "",
    logoUrl: "",

    receiptHeader: "",
    receiptFooter: "",

    taxEnabled: false,
    taxRate: "0",

    currency: "IDR",
    timezone: "Asia/Jakarta",

    allowNegativeStock: false,
  }

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <StoreSettingsForm initialData={initialData} />
    </div>
  )
}