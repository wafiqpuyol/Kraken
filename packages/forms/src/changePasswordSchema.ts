import { z } from "zod";

const PasswordSchema = {
    currentPassword: z.string().min(1, { message: "Current Password is required" }),
}

const PasswordMatchSchema = z.object({
    newPassword: z.string().min(1, { message: "New Password is required" }),
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