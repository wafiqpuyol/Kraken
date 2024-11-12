"use server"

import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { addMoneyPayload, AddMoneySchema } from "@repo/forms/addMoneySchema"
import { LOCK_AMOUNT, WITHDRAW_LIMIT } from "@repo/ui/constants"
import { updateAccount } from "./account"
import { getAllOnRampTransactions } from "./action"
import { redisManager } from "@repo/cache/redisManager"

export const addMoneyAction = async (payload: addMoneyPayload, token: string,
): Promise<{ message: string, status: number }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { message: "Unauthorized. Please login first", status: 401 }

        const validatedPayload = AddMoneySchema.safeParse(payload)
        if (!validatedPayload.success) {
            return {
                message: validatedPayload.error.format().phone_number?._errors[0] || validatedPayload.error.format().amount?._errors[0] || validatedPayload.error.format().bankURL?._errors[0] as string,
                status: 400
            }
        }
        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({
                where: {
                    AND: [
                        { id: session.user.uid },
                        { number: session.user.number },
                    ]
                }
            })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (isUserExist?.number !== payload.phone_number) return { message: "User with this phone number doesn't exist", status: 404 }
        if (!isUserExist) return { message: "User not found. Please login", status: 401 }
        if (!isUserExist.isVerified) return { message: "Please verify your account first to deposit money", status: 401 }

        /* -------------------- Check Account Status -------------------- */
        let userBalance = await redisManager().getUserField(`${session.user.number}_userCred`, "balance")
        if (!userBalance) {
            userBalance = await prisma.balance.findFirst({
                where: { userId: session.user.uid }
            })
            if (userBalance) await redisManager().updateUserCred(session.user.number.toString(), "balance", JSON.stringify(userBalance))
        }
        if (!userBalance) { return { message: "User balance not found. Please login", status: 401 } }
        // @ts-ignore
        const withDrawCurrency = WITHDRAW_LIMIT[userBalance.currency];

        let userAccount = await redisManager().getUserField(`${session.user.number}_userCred`, "account")
        if (!userAccount) {
            userAccount = await prisma.account.findFirst({ where: { userId: session.user.uid } })
            if (userAccount) await redisManager().updateUserCred(session.user.number.toString(), "account", JSON.stringify(userAccount))
        }
        if (!userAccount) {
            return { message: "User account not found. Please login", status: 401 }
        }

        const withDrawLimit = await getAllOnRampTransactions(session.user.uid)
        if (userAccount.dailyLimitExceed) {
            if ((withDrawLimit.perDayTotal / 100) === parseFloat(withDrawCurrency.totalTransactionLimit.day)) {
                return { message: "You have exceeded your daily withdrawal limit", status: 422 }
            }
            if ((withDrawLimit.perMonthTotal / 100) === parseFloat(withDrawCurrency.totalTransactionLimit.month)) {
                return { message: "You have exceeded your monthly withdrawal limit", status: 422 }
            }
            if (withDrawLimit.perDayTotal === 0) {
                await updateAccount({ dailyLimitExceed: false })
            }
        }

        /* -------------------- validate Amount -------------------- */
        const updatedPerDayTotal = (parseFloat(payload.amount) + (withDrawLimit.perDayTotal / 100))
        const updatedPerMonthTotal = (parseFloat(payload.amount) + (withDrawLimit.perMonthTotal) / 100)
        if (updatedPerDayTotal > parseFloat(withDrawCurrency.totalTransactionLimit.day)) {
            return { message: `Amount is exceeding daily limit of ${withDrawCurrency.totalTransactionLimit.day}${withDrawCurrency.symbol}`, status: 422 }
        }
        if (updatedPerMonthTotal > parseFloat(withDrawCurrency.totalTransactionLimit.month)) {
            return { message: `Amount is exceeding monthly limit of ${withDrawCurrency.totalTransactionLimit.month}${withDrawCurrency.symbol}`, status: 422 }
        }
        if (parseInt(payload.amount) < parseInt(withDrawCurrency.perTransactionLimit.min)) {
            return { message: `Amount cannot be less than ${withDrawCurrency.perTransactionLimit.min}${withDrawCurrency.symbol}`, status: 400 }
        }
        if (parseInt(payload.amount) > parseInt(withDrawCurrency.perTransactionLimit.max)) {
            return { message: `Amount cannot be greater than ${withDrawCurrency.perTransactionLimit.max}${withDrawCurrency.symbol}`, status: 400 }
        }

        /* -------------------- validate User Wallet -------------------- */
        const isWalletExist = await prisma.wallet.findFirst({
            where: { userId: session.user.uid }
        })
        if (!isWalletExist) {
            return { message: "User wallet not found.", status: 401 }
        }
        if (!isWalletExist.withDrawOTPVerified) {
            return { message: "Please verify your wallet by entering OTP from your authenticator app to withdraw money", status: 400 }
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
                return { message: `You don't have sufficient balance to lock`, status: 400 }
            }
            if (parseInt(payload.lock!) < parseInt(LOCK_AMOUNT.min)) {
                return { message: `Lock Amount cannot be less than ${LOCK_AMOUNT.min}${withDrawCurrency.symbol}`, status: 400 }
            }
            if (parseInt(payload.lock!) > parseInt(LOCK_AMOUNT.max)) {
                return { message: `Lock Amount cannot be greater than ${LOCK_AMOUNT.max}${withDrawCurrency.symbol}`, status: 400 }
            }
            if (parseInt(payload.lock!) >= (userBalance.amount / 100)) {
                return { message: "Lock amount cannot be equal to your current balance", status: 400 }
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
        if (updatedPerDayTotal === parseFloat(withDrawCurrency.totalTransactionLimit.day)) {
            await updateAccount({ dailyLimitExceed: true })
        }
        if (updatedPerMonthTotal === parseFloat(withDrawCurrency.totalTransactionLimit.month)) {
            await updateAccount({ dailyLimitExceed: true })
        }
        return { message: "You're withdrawal is processing", status: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something went wrong", status: 500 }
    }
}