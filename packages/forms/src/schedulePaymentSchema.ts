import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import z from "zod";

export const SchedulePaymentSchema = z.object({
    currency: z.string({ required_error: "Currency is required" }).optional(),
    payment_date: z.date({ required_error: "Payment Date is required" }),
    amount: z.string({ required_error: "Amount is required", message: "Please enter a valid amount" }),
    payee_number: z.string({ required_error: "Payee number is required" })
        .refine(isValidPhoneNumber, "Please specify a valid phone number (include the country code).")
        .transform((value) => parsePhoneNumber(value).number.toString()),
    pincode: z.string({ required_error: "Pincode is required" }).min(6, { message: "Please enter a valid pincode" }),
});

export type schedulePaymentPayload = z.infer<typeof SchedulePaymentSchema>
export type scheduleSchemaType = typeof SchedulePaymentSchema