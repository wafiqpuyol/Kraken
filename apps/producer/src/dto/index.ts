import { notification } from "@repo/db/type"

export interface IDepositPayload {
    amount: number
    userId: number
    token: string,
    tokenValidation: "Failed" | "Success"
    lockedAmount: number
}

export type INotificationTemplate = notification & { receiver_id: number }