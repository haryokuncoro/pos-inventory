"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { updateUser } from "@/lib/actions/users";
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"

const profileSettingSchema = z.object({
  userId: z.string(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(150, "Name must be at most 150 characters"),
  currentPassword: z.string(),
  password: z
    .string()
    .refine(
      (value) => value === "" || (value.length >= 6 && value.length <= 100),
      "Password must be between 6 and 100 characters",
    ),
  email: z
    .string()
    .max(150, "Email must be at most 150 characters")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Invalid email address",
    )
})

export type ProfileSettingsFormValues = z.infer<
  typeof profileSettingSchema
>


export function ProfileSettingsForm() {
  const [session, setSession] = useState<typeof authClient.$Infer.Session | null>(null)

  useEffect(() => {
    authClient.getSession().then(({ data }) => setSession(data))
  }, [])

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingSchema),
    defaultValues: {
      userId: "",
      name: "",
      password: "",
      currentPassword: "",
      email: "",
    },
  })

  useEffect(() => {
    if (!session?.user) {
      return
    }

    form.reset({
      userId: session.user.id,
      name: session.user.name,
      password: "",
      currentPassword: "",
      email: session.user.email,
    })
  }, [form, session])


  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form


  async function onSubmit(
    values: ProfileSettingsFormValues,
  ) {
    try {
      if (!values.userId) {
        throw new Error("Unable to identify the current user")
      }

      await updateUser(values.userId, {
        name: values.name,
        email: values.email,
      })

      if (values.password) {
        if (!values.currentPassword) {
          throw new Error("Current password is required to change password")
        }

        const { error } = await authClient.changePassword({
          newPassword: values.password,
          currentPassword: values.currentPassword,
          revokeOtherSessions: false,
        })

        if (error) {
          throw new Error(error.message || "Unable to update password")
        }
      }

      form.setValue("password", "")
      form.setValue("currentPassword", "")
      toast.success("Profile updated")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update profile.",
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
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>
            Manage your profile information.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name
                </Label>

                <Input
                  {...field}
                  id="name"
                  placeholder="Your name"
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
                  placeholder="Your email"
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
            name="currentPassword"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  Current Password
                </Label>

                <Input
                  {...field}
                  id="currentPassword"
                  type="password"
                  placeholder="Your current password"
                  autoComplete="current-password"
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
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="password">
                  New Password
                </Label>

                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="Your new password"
                  autoComplete="new-password"
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