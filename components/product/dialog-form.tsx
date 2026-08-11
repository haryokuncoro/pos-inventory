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

type ProductFormValues = {
  name: string
  categoryId: string
  description: string
  isActive: boolean
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedProduct ? "Update product" : "Create product"}</DialogTitle>
          <DialogDescription>
            {selectedProduct
              ? "Update the product details below."
              : "Create a new product for your inventory."}
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