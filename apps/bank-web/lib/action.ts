"use server"

import { prisma } from "@repo/db/client"
import axios from "axios"

interface IWebhookPayload {
    amount: number
    userId: number
    token: string,
    tokenValidation: "Failure" | "Success"
}

const webHookCall = async (payload: IWebhookPayload) => {
    await axios.post(`${process.env.NEXT_PUBLIC_WEEBHOOK_API_URL}/webhook`, payload)
}

export const transactionAction = async (userId: number, token: string): Promise<{ message: string, statusCode: number }> => {

    try {
        const isUserExist = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!isUserExist) {
            return { message: "Invalid User Id", statusCode: 400 }
        }

        const isTokenValid = await axios.post(`${process.env.NEXT_PUBLIC_BANK_API_URL}/verify`, { token: token })
        const tokenDecodedData = isTokenValid.data.token.data
        if (!tokenDecodedData || tokenDecodedData !== isUserExist.id) {
            return { message: "Invalid Token", statusCode: 400 }
        }
        const isOnRampExist = await prisma.onramptransaction.findFirst({
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
        });
        if (!isOnRampExist) {
            throw new Error("Onramp doesn't exist")
        }
        await webHookCall({ amount: isOnRampExist.amount, userId, token, tokenValidation: "Success" })
        return { message: "ok", statusCode: 200 }
    } catch (error: any) {
        console.log("--------------->", error.message);
        webHookCall({ amount: 0, userId, token, tokenValidation: "Failure" })
        return { message: "token is invalid", statusCode: 403 }
    }
}