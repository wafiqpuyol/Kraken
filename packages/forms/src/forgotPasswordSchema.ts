import { z } from "zod"

export const ForgotPasswordSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Email must be a valid email" }),
})

export type forgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>