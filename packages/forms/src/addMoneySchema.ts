import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import z from "zod";

export const AddMoneySchema = z.object({
    amount: z.string({ message: "Please specify an amount" }).min(2, { message: "Send atleast $10" }),
    phone_number: z.string()
        .refine(isValidPhoneNumber, "Please specify a valid phone number (include the international prefix).")
        .transform((value) => parsePhoneNumber(value).number.toString()),
    bankURL: z.string().min(1, { message: "Please select a bank" }),
});

export type addMoneyPayload = z.infer<typeof AddMoneySchema>