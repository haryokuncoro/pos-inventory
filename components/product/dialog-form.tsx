import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller, type Control, type UseFormHandleSubmit } from "react-hook-form"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { SelectCategory, SelectProduct } from "@/db/schema"

export type ProductVariantFormValues = {
  id?: string
  sku: string
  name: string
  costPrice: string
  sellingPrice: string
  isActive: boolean
}

export type ProductFormValues = {
  name: string
  categoryId: string
  description: string
  isActive: boolean
  variants: ProductVariantFormValues[]
}

type ProductDialogFormProps = {
  selectedProduct: SelectProduct | null
  categories: SelectCategory[]
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  resetModal: () => void
  onSubmit: (data: ProductFormValues) => void
  control: Control<ProductFormValues>
  handleSubmit: UseFormHandleSubmit<ProductFormValues>
  isSubmitting: boolean
  openCreateModal: () => void
  variants: ProductVariantFormValues[]
  appendVariant: () => void
  removeVariant: (index: number) => void
}

export default function ProductDialogForm({
  selectedProduct,
  categories,
  dialogOpen,
  setDialogOpen,
  resetModal,
  onSubmit,
  control,
  handleSubmit,
  isSubmitting,
  openCreateModal,
  variants,
  appendVariant,
  removeVariant,
}: ProductDialogFormProps) {
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          resetModal()
        }
      }}
    >
      <DialogTrigger render={<Button onClick={openCreateModal}>Add product</Button>} />

      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedProduct ? "Update product" : "Create product"}</DialogTitle>
          <DialogDescription>
            {selectedProduct
              ? "Update the product details and variants below."
              : "Create a new product with one or more variants for your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Product name is required." }}
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <Input
                    id="product-name"
                    placeholder="Enter product name"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.error ? (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: "Please select a category." }}
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <select
                    id="product-category"
                    className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {fieldState.error ? (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  id="product-description"
                  placeholder="Optional description"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <input
                  id="product-is-active"
                  type="checkbox"
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  className="h-4 w-4"
                />
              )}
            />
            <Label htmlFor="product-is-active">Active</Label>
          </div>

          <div className="space-y-3 rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Variants</h4>
              <Button type="button" variant="outline" size="sm" onClick={appendVariant}>
                Add variant
              </Button>
            </div>

            {variants.length > 0 ? (
              variants.map((variant, index) => (
                <div key={`${variant.sku ?? "variant"}-${index}`} className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Variant {index + 1}</span>
                    {variants.length > 1 ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                        Remove
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`variant-sku-${index}`}>SKU</Label>
                      <Controller
                        name={`variants.${index}.sku`}
                        control={control}
                        rules={{ required: "SKU is required." }}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <Input
                              id={`variant-sku-${index}`}
                              placeholder="SKU"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {fieldState.error ? (
                              <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`variant-name-${index}`}>Variant Name</Label>
                      <Controller
                        name={`variants.${index}.name`}
                        control={control}
                        rules={{ required: "Variant name is required." }}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <Input
                              id={`variant-name-${index}`}
                              placeholder="Variant name"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {fieldState.error ? (
                              <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`variant-cost-${index}`}>Cost Price</Label>
                      <Controller
                        name={`variants.${index}.costPrice`}
                        control={control}
                        rules={{ required: "Cost price is required." }}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <Input
                              id={`variant-cost-${index}`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {fieldState.error ? (
                              <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`variant-selling-${index}`}>Selling Price</Label>
                      <Controller
                        name={`variants.${index}.sellingPrice`}
                        control={control}
                        rules={{ required: "Selling price is required." }}
                        render={({ field, fieldState }) => (
                          <div className="space-y-1">
                            <Input
                              id={`variant-selling-${index}`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {fieldState.error ? (
                              <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Controller
                      name={`variants.${index}.isActive`}
                      control={control}
                      render={({ field }) => (
                        <input
                          id={`variant-is-active-${index}`}
                          type="checkbox"
                          checked={Boolean(field.value)}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="h-4 w-4"
                        />
                      )}
                    />
                    <Label htmlFor={`variant-is-active-${index}`}>Active</Label>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No variants yet. Add one to start tracking stock.</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedProduct ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}