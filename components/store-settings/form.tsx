"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createStoreSettings, updateStoreSettings } from "@/lib/actions/store-settings";

const storeSettingsSchema = z.object({
  storeId: z.string(),
  storeSettingsId: z.string(),
  name: z
    .string()
    .min(1, "Store name is required")
    .max(150, "Store name must be at most 150 characters"),

  code: z
    .string()
    .min(1, "Store code is required")
    .max(50, "Store code must be at most 50 characters"),

  address: z
    .string()
    .max(500, "Address must be at most 500 characters"),

  phone: z
    .string()
    .max(30, "Phone must be at most 30 characters"),

  email: z
    .string()
    .max(150, "Email must be at most 150 characters")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Invalid email address",
    ),

  logoUrl: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        z.string().url().safeParse(value).success,
      "Invalid logo URL",
    ),

  receiptHeader: z
    .string()
    .max(500, "Receipt header must be at most 500 characters"),

  receiptFooter: z
    .string()
    .max(500, "Receipt footer must be at most 500 characters"),

  taxEnabled: z.boolean(),

  taxRate: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Tax rate must be a valid number",
    )
    .refine(
      (value) => Number(value) >= 0 && Number(value) <= 100,
      "Tax rate must be between 0 and 100",
    ),

  currency: z
    .string()
    .length(3, "Currency must be exactly 3 characters"),

  timezone: z
    .string()
    .min(1, "Timezone is required")
    .max(50, "Timezone must be at most 50 characters"),

  allowNegativeStock: z.boolean(),
})

export type StoreSettingsFormValues = z.infer<
  typeof storeSettingsSchema
>

type StoreSettingsFormProps = {
  initialData: StoreSettingsFormValues
}

export function StoreSettingsForm({
  initialData,
}: StoreSettingsFormProps) {
  const form = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: initialData,
  })
  const storeId = initialData.storeId
  const storeSettingsId = initialData.storeSettingsId

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form

  const taxEnabled = watch("taxEnabled")

  async function onSubmit(
    values: StoreSettingsFormValues,
  ) {
    try {
      const storeData = {
        name: values.name,
        code: values.code,
        address: values.address,
        phone: values.phone,
        email: values.email,
        logoUrl: values.logoUrl,
      }
      const settingsData = {
        receiptHeader: values.receiptHeader,
        receiptFooter: values.receiptFooter,
        taxEnabled: values.taxEnabled,
        taxRate: values.taxRate,
        currency: values.currency,
        timezone: values.timezone,
        allowNegativeStock: values.allowNegativeStock,
      }

      if (storeId && storeSettingsId) {
        await updateStoreSettings(storeId, storeSettingsId, storeData, settingsData)
        toast.success("Store settings updated")
      } else {
        await createStoreSettings(storeData, settingsData)
        toast.success("Store settings saved")
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save store settings.",
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Store Information */}

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            Manage your store information.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Store Name
                  </Label>

                  <Input
                    {...field}
                    id="name"
                    placeholder="My Store"
                  />

                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Store Code
                  </Label>

                  <Input
                    {...field}
                    id="code"
                    placeholder="STORE-001"
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

          <Controller
            name="address"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="address">
                  Address
                </Label>

                <Textarea
                  {...field}
                  id="address"
                  placeholder="Store address"
                  rows={3}
                />

                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone
                  </Label>

                  <Input
                    {...field}
                    id="phone"
                    placeholder="08123456789"
                  />

                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email
                  </Label>

                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="store@example.com"
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

          <Controller
            name="logoUrl"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="logoUrl">
                  Logo URL
                </Label>

                <Input
                  {...field}
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                />

                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Receipt */}

      <Card>
        <CardHeader>
          <CardTitle>Receipt</CardTitle>
          <CardDescription>
            Configure the information displayed on receipts.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Controller
            name="receiptHeader"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="receiptHeader">
                  Receipt Header
                </Label>

                <Textarea
                  {...field}
                  id="receiptHeader"
                  placeholder="Welcome to our store"
                  rows={3}
                />

                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="receiptFooter"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="receiptFooter">
                  Receipt Footer
                </Label>

                <Textarea
                  {...field}
                  id="receiptFooter"
                  placeholder="Thank you for shopping with us"
                  rows={3}
                />

                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Tax */}

      <Card>
        <CardHeader>
          <CardTitle>Tax</CardTitle>
          <CardDescription>
            Configure tax calculation for sales.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Controller
            name="taxEnabled"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label>
                    Enable Tax
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Automatically calculate tax on sales.
                  </p>
                </div>

                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          {taxEnabled && (
            <Controller
              name="taxRate"
              control={control}
              render={({ field, fieldState }) => (
                <div className="max-w-sm space-y-2">
                  <Label htmlFor="taxRate">
                    Tax Rate (%)
                  </Label>

                  <div className="relative">
                    <Input
                      {...field}
                      id="taxRate"
                      inputMode="decimal"
                      placeholder="11.00"
                      className="pr-8"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>

                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Regional */}

      <Card>
        <CardHeader>
          <CardTitle>Regional</CardTitle>
          <CardDescription>
            Configure currency and timezone.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <Controller
            name="currency"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="currency">
                  Currency
                </Label>

                <Input
                  {...field}
                  id="currency"
                  placeholder="IDR"
                  maxLength={3}
                  className="uppercase"
                />

                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="timezone"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="timezone">
                  Timezone
                </Label>

                <Input
                  {...field}
                  id="timezone"
                  placeholder="Asia/Jakarta"
                />

                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Inventory */}

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Configure inventory behavior.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Controller
            name="allowNegativeStock"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label>
                    Allow Negative Stock
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Allow products to be sold when stock reaches zero.
                  </p>
                </div>

                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Actions */}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}