import {SchedulePaymentSchema} from "./schedulePaymentSchema"
import z from "zod";

export const EditSchdulePaymentSchema = SchedulePaymentSchema.omit({pincode:true})
.extend({
    payee_name:z.string({ required_error: "Payee Name is required" }).min(2, {message:"Name cannot less than 2 character"})
})
export type editSchdulePaymentPayload =  z.infer<typeof EditSchdulePaymentSchema>
export type editSchdulePaymentSchemaType = typeof EditSchdulePaymentSchema