import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import z from "zod";

export const LoginSchema = z.object({
    phone_number: z.string()
        .refine(isValidPhoneNumber, "Please specify a valid phone number (include the international prefix).")
        .transform((value) => parsePhoneNumber(value).number.toString()),
    password: z.string().min(1, { message: "Password is required" }),
});

export type loginPayload = z.infer<typeof LoginSchema>