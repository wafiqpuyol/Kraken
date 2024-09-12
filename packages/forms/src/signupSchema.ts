
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

export type signUpPayload = Zod.infer<typeof SignUpSchema>;