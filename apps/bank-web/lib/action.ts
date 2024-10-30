"use server"

import { prisma } from "@repo/db/client"
import { onramptransaction, user } from "@repo/db/type"
import axios, { AxiosError } from "axios"

interface IWebhookPayload {
    amount: number
    userId: number
    token: string,
    tokenValidation: "Failed" | "Success"
    lockedAmount: number
}

const webHookCall = async (payload: IWebhookPayload) => {
    await axios.post(`${process.env.NEXT_PUBLIC_WEEBHOOK_API_URL}/webhook`, payload)
}


class TransactionAction {
    static instance: TransactionAction
    private onRamp: onramptransaction | null = null
    private user: user | null = null
    private constructor() { }

    async validateOnRampExist(userId: number, token: string) {
        return prisma.onramptransaction.findFirst({
            where: {
                AND: [
                    {
                        token: token
                    },
                    {
                        userId: userId
                    }
                ]
            }
        })
    }
    async validateUser(userId: number) {
        return prisma.user.findFirst({
            where: {
                id: userId
            },
            include: {
                preference: {
                    select: {
                        language: true
                    }
                }
            }
        })
    }

    async start(userId: number, token: string | null) {
        try {
            if (token == null) {
                throw new Error("Invalid Token",)
            }
            const isUserExist = await this.validateUser(userId)
            if (!isUserExist) {
                throw new Error("Invalid User Id")
            }
            this.user = isUserExist
            const isTokenValid = await axios.post(`${process.env.NEXT_PUBLIC_BANK_API_URL}/verify`, { token: token })
            const tokenDecodedData = isTokenValid.data.token.data
            if (!tokenDecodedData || tokenDecodedData !== isUserExist.id) {
                throw new Error("Invalid User Id")
            }

            const isOnRampExist = await this.validateOnRampExist(userId, token)

            if (!isOnRampExist) {
                throw new Error("Onramp doesn't exist. You are not authorized. Please login to your wallet account or create one.")
            }
            this.onRamp = isOnRampExist
            await webHookCall({ amount: isOnRampExist.amount, lockedAmount: isOnRampExist.lockedAmount, userId, token, tokenValidation: "Success", })
            return { message: "Onramp Successful", statusCode: 200, language: isUserExist.preference?.language! }
        } catch (error: any) {
            if (error instanceof AxiosError) {
                error.message = error.response?.data.message
            }

            if (error.message === "Invalid User Id") {
                return { message: error.message, statusCode: 400 }
            }

            await webHookCall({ amount: this.onRamp?.amount || 0, lockedAmount: this.onRamp?.lockedAmount || 0, userId, token: token === null ? "" : token, tokenValidation: "Failed" })

            switch (error.message) {
                case "Token has expired. Please go back to your wallet and try again":
                    return { message: error.message, statusCode: 401 }
                case "Invalid Token":
                    return { message: error.message, statusCode: 498 }
                case "Onramp doesn't exist. You are not authorized. Please login to your wallet account or create one.":
                    return { message: error.message, statusCode: 403 }
                default:
                    return { message: error.message || "Something went wrong on the bank server", statusCode: 500 }
            }
        }
    }

    static getInstance() {
        this.instance = new TransactionAction();
        return this.instance;
    }
}

export const transactionAction = (userId: number, token: string | null) => {
    return TransactionAction.getInstance().start(userId, token)
}