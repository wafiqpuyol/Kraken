export interface IDepositPayload {
    amount: number
    userId: number
    token: string,
    tokenValidation: "Failed" | "Success"
    lockedAmount: number
}

export interface INotificationTemplate {
    transactionID: string
    amount: number
    currency: string
    sender_number: string
    sender_name: string
    timestamp: Date
}