import { z } from "zod"

export const ConfirmMailSchema = z.object({
    authorization_code: z
        .string({ required_error: "Authorization code is required", invalid_type_error: "Invalid authorization code" })
        .length(32, { message: "Invalid authorization code" }),
    confirmation_code: z
        .string({ required_error: "Confirmation code is required", invalid_type_error: "Invalid confirmation code" })
        .length(32, { message: "Invalid confirmation code" }),
})

export type confirmMailPayload = z.infer<typeof ConfirmMailSchema> 