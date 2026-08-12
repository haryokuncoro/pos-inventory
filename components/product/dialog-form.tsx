import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormHandleSubmit,
} from "react-hook-form"
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

// Types

export type ProductVariantFormValues = {
  id?: string
  sku: string
  name: string
  stockQuantity: number
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

// Reusable form components

type FormInputProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  id: string
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  step?: string
  rules?: Parameters<typeof Controller<T>>[0]["rules"]
}

function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  id,
  placeholder,
  type = "text",
  step,
  rules,
}: FormInputProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <div className="space-y-1">
            <Input
              id={id}
              type={type}
              step={step}
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(event) => {
                if (type === "number") {
                  const value = event.target.value

                  field.onChange(
                    value === "" ? undefined : Number(value)
                  )
                  return
                }

                field.onChange(event.target.value)
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />

            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}

type FormSelectProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  id: string
  placeholder: string
  options: {
    value: string
    label: string
  }[]
  rules?: Parameters<typeof Controller<T>>[0]["rules"]
}

function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  id,
  placeholder,
  options,
  rules,
}: FormSelectProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <div className="space-y-1">
            <select
              id={id}
              name={field.name}
              ref={field.ref}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm"
            >
              <option value="">{placeholder}</option>

              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}

type FormCheckboxProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  id: string
  label: string
}

function FormCheckbox<T extends FieldValues>({
  control,
  name,
  id,
  label,
}: FormCheckboxProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            id={id}
            type="checkbox"
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            className="h-4 w-4"
          />
        )}
      />

      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Variant form
// -----------------------------------------------------------------------------

type VariantFormProps = {
  control: Control<ProductFormValues>
  index: number
  canRemove: boolean
  onRemove: () => void
}

function VariantForm({
  control,
  index,
  canRemove,
  onRemove,
}: VariantFormProps) {
  const prefix = `variants.${index}` as const

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Variant {index + 1}
        </span>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <FormInput
          control={control}
          name={`${prefix}.sku`}
          id={`variant-sku-${index}`}
          label="SKU"
          placeholder="SKU"
          rules={{
            required: "SKU is required.",
          }}
        />

        <FormInput
          control={control}
          name={`${prefix}.stockQuantity`}
          id={`variant-stock-${index}`}
          label="Stock Quantity"
          placeholder="Stock quantity"
          type="number"
          rules={{
            required: "Stock quantity is required.",
            min: {
              value: 0,
              message: "Stock quantity cannot be negative.",
            },
          }}
        />

        <FormInput
          control={control}
          name={`${prefix}.name`}
          id={`variant-name-${index}`}
          label="Variant Name"
          placeholder="Variant name"
          rules={{
            required: "Variant name is required.",
          }}
        />

        <FormInput
          control={control}
          name={`${prefix}.costPrice`}
          id={`variant-cost-${index}`}
          label="Cost Price"
          placeholder="0.00"
          type="number"
          step="0.01"
          rules={{
            required: "Cost price is required.",
          }}
        />

        <FormInput
          control={control}
          name={`${prefix}.sellingPrice`}
          id={`variant-selling-${index}`}
          label="Selling Price"
          placeholder="0.00"
          type="number"
          step="0.01"
          rules={{
            required: "Selling price is required.",
          }}
        />
      </div>

      <FormCheckbox
        control={control}
        name={`${prefix}.isActive`}
        id={`variant-is-active-${index}`}
        label="Active"
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Product dialog
// -----------------------------------------------------------------------------

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
  const isEditing = Boolean(selectedProduct)

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

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
      <DialogTrigger
        render={
          <Button onClick={openCreateModal}>
            Add product
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update product" : "Create product"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the product details and variants below."
              : "Create a new product with one or more variants for your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Product information */}
          <div className="space-y-4">
            <FormInput
              control={control}
              name="name"
              id="product-name"
              label="Name"
              placeholder="Enter product name"
              rules={{
                required: "Product name is required.",
              }}
            />

            <FormSelect
              control={control}
              name="categoryId"
              id="product-category"
              label="Category"
              placeholder="Select a category"
              options={categoryOptions}
              rules={{
                required: "Please select a category.",
              }}
            />

            <FormInput
              control={control}
              name="description"
              id="product-description"
              label="Description"
              placeholder="Optional description"
            />

            <FormCheckbox
              control={control}
              name="isActive"
              id="product-is-active"
              label="Active"
            />
          </div>

          {/* Variants */}
          <div className="space-y-3 rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Variants
              </h4>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={appendVariant}
              >
                Add variant
              </Button>
            </div>

            {variants.length > 0 ? (
              variants.map((variant, index) => (
                <VariantForm
                  key={variant.id ?? `new-${index}`}
                  control={control}
                  index={index}
                  canRemove={variants.length > 1}
                  onRemove={() => removeVariant(index)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No variants yet. Add one to start tracking stock.
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              }
            />

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}