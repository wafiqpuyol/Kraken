import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import z from "zod";

export const SendMoneySchema = z.object({
    currency: z.string({ required_error: "Currency is required" }).optional(),
    phone_number: z.string({ required_error: "Phone number is required" })
        .refine(isValidPhoneNumber, "Please specify a valid phone number (include the international prefix).")
        .transform((value) => parsePhoneNumber(value).number.toString()),
    pincode: z.string({ required_error: "Pincode is required" }).min(6, { message: "Please enter a valid pincode" }),
    amount: z.string({ required_error: "Amount is required", message: "Please enter a valid amount" }),
});

export type sendMoneyPayload = z.infer<typeof SendMoneySchema>
export type sendMoneySchemaType = typeof SendMoneySchema