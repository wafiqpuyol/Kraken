import { z } from "zod";

const PasswordSchema = {
    currentPassword: z.string().min(1, { message: "Current Password is required" }),
}

export const PasswordMatchSchema = z.object({
    newPassword: z.string()
        .describe("Password")
        .min(6, { message: "Password must be atleast 6 characters" })
        .max(14, { message: "Password must be within 14 characters" }),
    ConfirmPassword: z.string()
}).superRefine(({ newPassword, ConfirmPassword }, ctx) => {
    if (newPassword !== ConfirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Passwords did not matched",
            path: ['ConfirmPassword'],
        })
    }
})


export const ChangePasswordSchema = z.object(PasswordSchema).and(PasswordMatchSchema)
export type changePasswordPayload = z.infer<typeof ChangePasswordSchema>