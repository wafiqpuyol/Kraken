export interface IWebhookPayload {
    amount: number
    userId: number
    token: string,
    tokenValidation: "Failure" | "Success"
}