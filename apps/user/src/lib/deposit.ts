"use server"

import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { addMoneyPayload, AddMoneySchema } from "@repo/forms/addMoneySchema"
import { LOCK_AMOUNT, WITHDRAW_LIMIT } from "@repo/ui/constants"

export const addMoneyAction = async (payload: addMoneyPayload, token: string): Promise<{ message: string, statusCode: number }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { message: "Unauthorized. Please login first", statusCode: 401 }
        if (session?.user.number !== payload.phone_number) return { message: "User with this phone number doesn't exist", statusCode: 404 }

        const validatedPayload = AddMoneySchema.safeParse(payload)
        if (!validatedPayload.success) {
            return {
                message: validatedPayload.error.format().phone_number?._errors[0] || validatedPayload.error.format().amount?._errors[0] || validatedPayload.error.format().bankURL?._errors[0] as string,
                statusCode: 400
            }
        }
        const isUserExist = await prisma.user.findFirst({
            where: {
                AND: [
                    { id: session.user.uid },
                    { number: session.user.number },
                ]
            }
        })

        if (!isUserExist) return { message: "User not found. Please login", statusCode: 401 }
        if (!isUserExist.isVerified) return { message: "Please verify your account first to send money", statusCode: 401 }

        /* -------------------- validate Amount -------------------- */
        const userBalance = await prisma.balance.findFirst({
            where: { userId: session.user.uid }
        })
        if (!userBalance) { return { message: "User balance not found. Please login", statusCode: 401 } }
        const withDrawCurrency = WITHDRAW_LIMIT[userBalance.currency];
        if (parseInt(payload.amount) < parseInt(withDrawCurrency.perTransactionLimit.min)) {
            return { message: `Amount cannot be less than ${withDrawCurrency.perTransactionLimit.min}${withDrawCurrency.symbol}`, statusCode: 400 }
        }
        if (parseInt(payload.amount) > parseInt(withDrawCurrency.perTransactionLimit.max)) {
            return { message: `Amount cannot be greater than ${withDrawCurrency.perTransactionLimit.max}${withDrawCurrency.symbol}`, statusCode: 400 }
        }

        /* -------------------- validate Lock Amount -------------------- */
        if (payload.lock !== "0") {
            if (
                parseInt(payload.lock!) >= parseInt(LOCK_AMOUNT.min)
                &&
                parseInt(payload.lock!) <= parseInt(LOCK_AMOUNT.max)
                &&
                parseInt(payload.lock!) > (userBalance.amount / 100)
            ) {
                return { message: `You don't have sufficient balance to lock`, statusCode: 400 }
            }
            if (parseInt(payload.lock!) < parseInt(LOCK_AMOUNT.min)) {
                return { message: `Lock Amount cannot be less than ${LOCK_AMOUNT.min}${withDrawCurrency.symbol}`, statusCode: 400 }
            }
            if (parseInt(payload.lock!) > parseInt(LOCK_AMOUNT.max)) {
                return { message: `Lock Amount cannot be greater than ${LOCK_AMOUNT.max}${withDrawCurrency.symbol}`, statusCode: 400 }
            }
            if (parseInt(payload.lock!) >= (userBalance.amount / 100)) {
                return { message: "Lock amount cannot be equal to your current balance", statusCode: 400 }
            }
        }

        await prisma.onramptransaction.create({
            data: {
                token: token,
                status: "Processing",
                userId: isUserExist.id,
                amount: parseInt(payload.amount) * 100,
                provider: payload.bankURL,
                startTime: new Date(),
                lockedAmount: parseInt(payload.lock!) * 100
            }
        })
        return { message: "success", statusCode: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something went wrong", statusCode: 500 }
    }
}