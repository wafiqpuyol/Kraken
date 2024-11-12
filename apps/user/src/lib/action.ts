"use server"
import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { onramptransaction, preference } from "@repo/db/type"
import { authOptions } from "@repo/network"
import { redisManager } from "@repo/cache/redisManager"

export const updatePreference = async (payload: Partial<preference>): Promise<{
    message: string;
    statusCode: number;
    updatedPreference?: preference
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { message: "unauthenticated", statusCode: 401 }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findUnique({
                where:
                    { number: session.user.number },
                include: {
                    preference: true
                }
            })
            if (isUserExist) await redisManager().updateUserCred(`${session.user.number}_userCred`, "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) return { message: "User not found. Please login", statusCode: 404 }
        if (Object.keys(payload).includes("notification_status") && !isUserExist.isVerified) {
            return { message: "Please verify your email first.", statusCode: 401 }
        }
        const updatedPreference = await prisma.preference.update({ where: { id: isUserExist.preference?.id, userId: isUserExist.id }, data: payload })
        return { message: "success", statusCode: 200, updatedPreference }
    } catch (error) {
        console.log(error)
        return { message: "Something went wrong", statusCode: 500 }
    }
}

export const getAllOnRampTransactions = async (userId: number) => {
    try {
        let onRampTransactions: [] | onramptransaction[] | null
        onRampTransactions = await redisManager().getCache(`${userId}_getAllOnRampTransactions`)
        if (!onRampTransactions) {
            onRampTransactions = await prisma.onramptransaction.findMany({ where: { userId: userId } })
            redisManager().setCache(`${userId}_getAllOnRampTransactions`, onRampTransactions)
        }

        return onRampTransactions.reduce((acc: { perDayTotal: number, perMonthTotal: number }, init: onramptransaction) => {
            if (new Date(init.startTime).getMonth() === new Date(Date.now()).getMonth() && init.status === "Success") {
                acc.perMonthTotal += (init.amount + init.lockedAmount)
            }
            if (new Date(init.startTime).getDate() === new Date(Date.now()).getDate() && init.status === "Success") {
                acc.perDayTotal += (init.amount + init.lockedAmount)
            }
            return acc
        }, { perDayTotal: 0, perMonthTotal: 0 })
    } catch (error) {
        console.log("getAllOnRampTransactions -->", error);
        return { perDayTotal: 0, perMonthTotal: 0 }
    }
}