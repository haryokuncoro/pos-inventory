"use client"

import * as React from "react"
import type { Dispatch, SetStateAction } from "react"
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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
import type { SelectCategory } from "@/db/schema"
import type {
  ProductFormValues,
  ProductRow,
} from "./table"

// Types

type ProductDialogFormProps = {
  form: UseFormReturn<ProductFormValues>
  variantFields: UseFieldArrayReturn<ProductFormValues, "variants", "id">["fields"]

  selectedProduct: ProductRow | null
  categories: SelectCategory[]
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  onClose: () => void
  onCreate: () => void

  onSubmit: (data: ProductFormValues) => Promise<void>

  onAppendVariant: () => void
  onRemoveVariant: (index: number) => void
}

// Reusable form components

type FormInputProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  id: string
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  parseAsNumber?: boolean
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
  parseAsNumber = false,
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
                if (parseAsNumber) {
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
          parseAsNumber
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
          placeholder="0"
          type="number"
          step="500"
          rules={{
            required: "Cost price is required.",
          }}
        />

        <FormInput
          control={control}
          name={`${prefix}.sellingPrice`}
          id={`variant-selling-${index}`}
          label="Selling Price"
          placeholder="0"
          type="number"
          step="500"
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
  form,
  variantFields,
  selectedProduct,
  categories,
  open,
  onOpenChange,
  onClose,
  onCreate,
  onSubmit,
  onAppendVariant,
  onRemoveVariant,
}: ProductDialogFormProps) {
  const isEditing = Boolean(selectedProduct)

  const isSubmitting = form.formState.isSubmitting

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value)

        if (!value) {
          onClose()
        }
      }}
    >
      <DialogTrigger
        onClick={onCreate}
        render={<Button variant="outline">Add product</Button>}
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
          id="product-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Product information */}
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-form-name">Name</FieldLabel>

                  <Input
                    {...field}
                    id="product-form-name"
                    placeholder="Enter product name"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <FormSelect
              control={form.control}
              name="categoryId"
              id="product-form-category"
              label="Category"
              placeholder="Select a category"
              options={categoryOptions}
              rules={{
                required: "Please select a category.",
              }}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-form-description">Description</FieldLabel>

                  <Input
                    {...field}
                    id="product-form-description"
                    placeholder="Optional description"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <FormCheckbox
              control={form.control}
              name="isActive"
              id="product-is-active"
              label="Active"
            />
          </FieldGroup>

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
                onClick={onAppendVariant}
              >
                Add variant
              </Button>
            </div>

            {variantFields.length > 0 ? (
              variantFields.map((variant, index) => (
                <VariantForm
                  key={variant.id ?? `new-${index}`}
                  control={form.control}
                  index={index}
                  canRemove={variantFields.length > 1}
                  onRemove={() => onRemoveVariant(index)}
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
            <DialogClose disabled={isSubmitting}>Cancel</DialogClose>

            <Button
              type="submit"
              form="product-form"
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