import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import z from "zod";

export const SendMoneySchema = z.object({
    phone_number: z.string()
        .refine(isValidPhoneNumber, "Please specify a valid phone number (include the international prefix).")
        .transform((value) => parsePhoneNumber(value).number.toString()),
    amount: z.string().min(2, { message: "Can't send less than $10" }).refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, { message: "Please enter a valid amount  ." })
});

export type sendMoneyPayload = z.infer<typeof SendMoneySchema>