"use client"

import type { Dispatch, SetStateAction } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Controller } from "react-hook-form"

import { Button } from "@/components/ui/button"
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import type { SelectCategory } from "@/db/schema"

import type { CategoryFormValues } from "./table"

type CategoryDialogFormProps = {
  form: UseFormReturn<CategoryFormValues>

  selectedCategory: SelectCategory | null

  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>

  onClose: () => void
  onCreate: () => void

  onSubmit: (
    values: CategoryFormValues
  ) => Promise<void>
}

export default function CategoryDialogForm({
  form,
  selectedCategory,
  open,
  onOpenChange,
  onClose,
  onCreate,
  onSubmit,
}: CategoryDialogFormProps) {
  const isEdit = Boolean(selectedCategory)

  const isSubmitting =
    form.formState.isSubmitting

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

      <DialogTrigger onClick={onCreate} render={<Button variant="outline">
        Add category
      </Button>} />


      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Update category"
              : "Create category"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the category name below."
              : "Create a new product category for your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="category-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="category-form-name">
                    Name
                  </FieldLabel>

                  <Input
                    {...field}
                    id="category-form-name"
                    placeholder="Enter category name"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose
            disabled={isSubmitting}
          >
            Cancel
          </DialogClose>

          <Button
            type="submit"
            form="category-form"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}