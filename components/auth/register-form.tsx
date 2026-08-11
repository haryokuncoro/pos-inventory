"use client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUp } from "@/server/users"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters."),  
  email: z
    .string()
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters."),
})

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const signInwithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard"
    })
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const { success, message } = await signUp(data.name, data.email, data.password)
    if(success) {
      toast.success(message)
      router.push("/dashboard")
    } else {
      toast.error(message)
    }
    setIsLoading(false)
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Register with your Email or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-register" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button" onClick={signInwithGoogle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Register with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-register-name">
                        Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-register-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Your name"
                        autoComplete="off"
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
                  <FieldLabel htmlFor="form-register-email">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-register-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="email@example.com"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
               <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-register-password">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    type="password"
                    id="form-register-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
              <Field>
                <Button disabled={isLoading} type="submit">
                  {isLoading ? <Loader2 className="animate-spin size-4" /> : "Register"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?
                  <Link href="/login"> Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
