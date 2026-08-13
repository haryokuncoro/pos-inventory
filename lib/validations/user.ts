import { z } from "zod"

export const userSchema = z.object({
  name: z.string().trim().min(1, "User name is required."),
  email: z.string().trim().email("Valid email is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .or(z.literal("")),
})
