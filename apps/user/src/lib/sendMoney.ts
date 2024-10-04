"use server"

import { sendMoneyPayload, SendMoneySchema } from "@repo/forms/sendMoneySchema"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { prisma } from "@repo/db/client"
import { p2ptransfer } from "@repo/db/type"
import { generateTransactionId } from "./utils"
import { verify } from "jsonwebtoken"
import { MINIMUM_AMOUNT } from "@repo/ui/constants"
import { } from "@repo/ui/constants"

export const sendMoneyAction = async (payload: sendMoneyPayload): Promise<{ message: string | undefined, status: number, transaction?: p2ptransfer | {} }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        const validatedPayload = SendMoneySchema.safeParse(payload)
        if (!validatedPayload.success) {
            console.log(validatedPayload.error.format().phone_number?._errors);
            return {
                message: validatedPayload.error.format().phone_number?._errors[0] || validatedPayload.error.format().amount?._errors[0] || validatedPayload.error.format().pincode?._errors[0],
                status: 400, field: validatedPayload.error.name || validatedPayload.error.name
            }
        }

        const isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) {
            return { message: "User not found", status: 401 }
        }
        if (!isUserExist.isVerified) {
            return { message: "Please verify your account first to send money", status: 401 }
        }

        const wallet = await prisma.wallet.findFirst({ where: { userId: isUserExist.id } })
        if (!wallet || !wallet.pincode) {
            return { message: "Pincode not found. Pincode is required to send money", status: 401 }
        }

        const decodedPincode = verify(wallet.pincode!, isUserExist.password)
        const isPincodeValid = decodedPincode === payload.pincode
        if (!isPincodeValid) {
            return { message: "Wrong pincode. Please enter the correct pincode", status: 401 }
        }

        const isRecipientExist = await prisma.user.findUnique({ where: { number: payload.phone_number } })
        if (!isRecipientExist) {
            return { message: "Recipient number not found. Please enter a valid recipient number", status: 404 }
        }

        if (isUserExist.number === isRecipientExist.number) {
            return { message: "Cannot send money to yourself. Invalid recipient number", status: 401 }
        }

        const senderBalance = await prisma.balance.findFirst({ where: { userId: isUserExist.id } })
        if (!senderBalance) {
            return { message: "Balance not found", status: 404 }
        }

        if (senderBalance?.amount < parseInt(payload.amount)) {
            return { message: "You're wallet does not have sufficient balance to make this transfer.", status: 401 }
        }
        const deductedAmount = (senderBalance?.amount - (parseInt(payload.amount) * 100)) / 100
        if (deductedAmount <= MINIMUM_AMOUNT) {
            return { message: `Insufficient funds; you must have at least ${MINIMUM_AMOUNT}${senderBalance.currency} remain after the transfer`, status: 403 }
        }


        let transaction: p2ptransfer | [] = [];
        await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT * FROM Balance WHERE userId=${isUserExist.id} FOR UPDATE`;

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
            const { currency } = (await prisma.preference.findFirst({ where: { userId: isUserExist.id } }))!
            transaction = await prisma.p2ptransfer.create({
                data: {
                    amount: parseInt(payload.amount),
                    timestamp: new Date(),
                    transactionType: "Send",
                    transactionID: generateTransactionId(),
                    fromUserId: isUserExist.id,
                    toUserId: isRecipientExist.id,
                    currency
                },
                include: {
                    user_p2ptransfer_fromUserIdTouser: {
                        select: {
                            name: true
                        }
                    },
                    user_p2ptransfer_toUserIdTouser: {
                        select: {
                            name: true
                        }
                    }
                },
            })
        })
        console.log("---------------ENTER 4 ---------------");
        return { message: "Sending money successful", status: 200, transaction }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Sending money failed. Something went wrong", status: 500 }
    }
}

export const getAllP2PTransactionHistories = async (): Promise<p2ptransfer[] | []> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return []
        }
        const isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) {
            return []
        }
        const p2pTransactionHistories = await prisma.p2ptransfer.findMany({
            where: {
                OR: [{ fromUserId: isUserExist.id }, { toUserId: isUserExist.id }],
            },
            include: {
                user_p2ptransfer_fromUserIdTouser: {
                    select: {
                        name: true
                    }
                },
                user_p2ptransfer_toUserIdTouser: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { timestamp: "desc" }
        })
        console.log(p2pTransactionHistories);
        return p2pTransactionHistories
    } catch (error) {
        console.log("getAllP2PTransactions =========>", error);
        return []
    }
}