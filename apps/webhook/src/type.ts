export interface IWebhookPayload {
    amount: number
    userId: number
    token: string,
    tokenValidation: "Failed" | "Success"
    lockedAmount: number
}