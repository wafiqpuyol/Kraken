
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import z from "zod";

export const SignUpSchema = z.object({
    name: z.string().describe("name"),
    phone_number: z.string()
        .refine(isValidPhoneNumber, "Please specify a valid phone number (include the international prefix).")
        .transform((value) => parsePhoneNumber(value).number.toString()),
    email: z.string().email().describe("Email").email({ message: "Email is required" }),
    password: z
        .string()
        .describe("Password")
        .min(6, { message: "Password must be atleast 6 characters" })
        .max(14, { message: "Password must be within 14 characters" }),
})
    .superRefine(({ password }, checkPassComplexity) => {
        const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
        const containsLowercase = (ch: string) => /[a-z]/.test(ch);
        const containsSpecialChar = (ch: string) =>
            /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
        let countOfUpperCase = 0,
            countOfLowerCase = 0,
            countOfNumbers = 0,
            countOfSpecialChar = 0;
        for (let i = 0; i < password.length; i++) {
            let ch = password.charAt(i);
            if (!isNaN(+ch)) countOfNumbers++;
            else if (containsUppercase(ch)) countOfUpperCase++;
            else if (containsLowercase(ch)) countOfLowerCase++;
            else if (containsSpecialChar(ch)) countOfSpecialChar++;
        }

        if (countOfLowerCase < 1) {
            checkPassComplexity.addIssue({
                code: "custom",
                message: "Passwords must contain at least 1 lowercase character",
                path: ["password"],
            });
        }
        if (countOfUpperCase < 1) {
            checkPassComplexity.addIssue({
                code: "custom",
                message: "Passwords must contain at least 1 uppercase character",
                path: ["password"],
            });
        }
        if (countOfSpecialChar < 1) {
            checkPassComplexity.addIssue({
                code: "custom",
                message: "Passwords must contain at least 1 special character",
                path: ["password"],
            });
        }
        if (countOfNumbers < 1) {
            checkPassComplexity.addIssue({
                code: "custom",
                message: "Passwords must contain at least 1 number",
                path: ["password"],
            });
        }
    }
    );

export type signUpPayload = Zod.infer<typeof SignUpSchema>;
