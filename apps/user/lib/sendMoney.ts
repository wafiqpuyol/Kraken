"use server"

import { sendMoneyPayload, SendMoneySchema } from "@repo/forms/sendMoneySchema"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { prisma } from "@repo/db/client"

export const sendMoneyAction = async (payload: sendMoneyPayload) => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        const validatedPayload = SendMoneySchema.safeParse(payload)
        if (!validatedPayload.success) {
            console.log(validatedPayload.error.format().phone_number?._errors);
            return {
                message: validatedPayload.error.format().phone_number?._errors[0] || validatedPayload.error.format().amount?._errors[0],
                status: 400, field: validatedPayload.error.name || validatedPayload.error.name
            }
        }

        const isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) {
            return { message: "User not found", status: 401 }
        }

        const isRecipientExist = await prisma.user.findUnique({ where: { number: payload.phone_number } })
        if (!isRecipientExist) {
            return { message: "Recipient not found", status: 404 }
        }

        if (isUserExist.number === isRecipientExist.number) {
            return { message: "Cannot send money to yourself", status: 401 }
        }
        const senderBalance = await prisma.balance.findFirst({ where: { userId: isUserExist.id } })
        if (!senderBalance) {
            return { message: "Please deposit atleast $10", status: 404 }
        }
        if (senderBalance?.amount < parseInt(payload.amount)) {
            return { message: "Insufficient balance", status: 401 }
        }
        const deductedAmount = (senderBalance?.amount - (parseInt(payload.amount) * 100)) / 100
        if (deductedAmount <= 10) {
            return { message: "Insufficient funds; you must have at least $10 remaining after the transfer.”", status: 403 }
        }

        await prisma.$transaction(async (tx) => {
            await tx.balance.update({
                where: {
                    userId: isUserExist.id
                },
                data: {
                    amount: {
                        decrement: parseInt(payload.amount) * 100
                    }
                }
            })
            await tx.balance.update({
                where: {
                    userId: isRecipientExist.id
                },
                data: {
                    amount: {
                        increment: parseInt(payload.amount) * 100
                    }
                }
            })
            await prisma.p2ptransfer.create({
                data: {
                    amount: parseInt(payload.amount),
                    timestamp: new Date(),
                    fromUserId: isUserExist.id,
                    toUserId: isRecipientExist.id
                }
            })
        })
        return { message: "Sending money successful", status: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Sending money failed. Something went wrong", status: 500 }
    }
}