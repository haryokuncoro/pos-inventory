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
import type { SelectUser } from "@/db/schema"

import type { UserFormValues } from "./table"

type UserDialogFormProps = {
  form: UseFormReturn<UserFormValues>

  selectedUser: SelectUser | null

  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>

  onClose: () => void
  onCreate: () => void

  onSubmit: (values: UserFormValues) => Promise<void>
}

export default function UserDialogForm({
  form,
  selectedUser,
  open,
  onOpenChange,
  onClose,
  onCreate,
  onSubmit,
}: UserDialogFormProps) {
  const isEdit = Boolean(selectedUser)
  const isSubmitting = form.formState.isSubmitting

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
      <DialogTrigger onClick={onCreate} render={<Button variant="outline">Add user</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update user" : "Create user"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the user information below."
              : "Create a new user account for your workspace."}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-form-name">Name</FieldLabel>

                  <Input
                    {...field}
                    id="user-form-name"
                    placeholder="Enter user name"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-form-email">Email</FieldLabel>

                  <Input
                    {...field}
                    id="user-form-email"
                    type="email"
                    placeholder="email@example.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {!isEdit && (
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-form-password">Password</FieldLabel>

                    <Input
                      {...field}
                      id="user-form-password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose disabled={isSubmitting}>Cancel</DialogClose>

          <Button type="submit" form="user-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
