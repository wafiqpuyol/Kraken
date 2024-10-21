import { z } from "zod";

const PasswordSchema = {
    currentPassword: z.string().min(1, { message: "Current Password is required" }),
}

export const PasswordMatchSchema = z.object({
    newPassword: z.string({ message: "New Password is required" })
        .describe("Password")
        .min(12, { message: "Password must be atleast 12 characters" })
        .max(36, { message: "Password must be within 36 characters" })
    ,
    ConfirmPassword: z.string({ message: "Confirm Password is required" })
})
    .superRefine(({ newPassword }, checkPassComplexity) => {
        const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
        const containsLowercase = (ch: string) => /[a-z]/.test(ch);
        const containsSpecialChar = (ch: string) =>
            /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
        let countOfUpperCase = 0,
            countOfLowerCase = 0,
            countOfNumbers = 0,
            countOfSpecialChar = 0;
        for (let i = 0; i < newPassword.length; i++) {
            let ch = newPassword.charAt(i);
            if (!isNaN(+ch)) countOfNumbers++;
            else if (containsUppercase(ch)) countOfUpperCase++;
            else if (containsLowercase(ch)) countOfLowerCase++;
            else if (containsSpecialChar(ch)) countOfSpecialChar++;
        }

        if (countOfLowerCase < 1) {
            checkPassComplexity.addIssue({
                code: "custom",
                message: "Passwords must contain at least 1 lowercase character",
                path: ["newPassword"],
            });
        }
        if (countOfUpperCase < 1) {
            checkPassComplexity.addIssue({
                code: "custom",
                message: "Passwords must contain at least 1 uppercase character",
                path: ["newPassword"],
            });
        }
        if (countOfSpecialChar < 1) {
            checkPassComplexity.addIssue({
                code: "custom",
                message: "Passwords must contain at least 1 special character",
                path: ["newPassword"],
            });
        }
        if (countOfNumbers < 1) {
            checkPassComplexity.addIssue({
                code: "custom",
                message: "Passwords must contain at least 1 number",
                path: ["newPassword"],
            });
        }
    }
    )
    .superRefine(({ newPassword, ConfirmPassword }, ctx) => {
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