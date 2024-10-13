import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import z from "zod";

export const AddMoneySchema = z.object({
    amount: z.string({ message: "Field is required", required_error: "Please specify an amount" }),
    lock: z.string({ message: "Field is required", required_error: "Please specify an amount" }).optional(),
    phone_number: z.string({ message: "Field is required", required_error: "Please specify an amount" })
        .refine(isValidPhoneNumber, { message: "Please specify a valid phone number (include the international prefix)." })
        .transform((value) => parsePhoneNumber(value).number.toString()),
    bankURL: z.string({ required_error: "Please select a bank" }).min(1, { message: "Please select a bank" }),
});

export type addMoneyPayload = z.infer<typeof AddMoneySchema>