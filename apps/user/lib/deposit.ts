"use server"

import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { addMoneyPayload } from "@repo/forms/addMoneySchema"


export const addMoneyAction = async (payload: addMoneyPayload, token: string): Promise<{ message: string, statusCode: number }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { message: "unauthenticated", statusCode: 401 }
        if (session?.user.number !== payload.phone_number) return { message: "User with this phone number not found", statusCode: 404 }

        const isUserExist = await prisma.user.findUnique({
            where:
                { number: session.user.number },
        })
        if (!isUserExist) return { message: "User not found. Please login", statusCode: 404 }

        await prisma.onRampTransaction.create({
            data: {
                token: token,
                status: "Processing",
                userId: isUserExist.id,
                amount: parseInt(payload.amount) * 100,
                provider: payload.bankURL || "unknown",
                startTime: new Date()
            }
        })
        return { message: "success", statusCode: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something went wrong", statusCode: 500 }
    }
}