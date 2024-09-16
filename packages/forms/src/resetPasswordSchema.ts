import { z } from "zod"

import { PasswordMatchSchema } from "./changePasswordSchema"
export type resetPasswordPayload = z.infer<typeof PasswordMatchSchema>