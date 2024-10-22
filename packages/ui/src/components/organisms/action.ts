"use server"

import { prisma } from "@repo/db/client"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"


export const getOnRampTransactionByDateRange = async (payload: { from: string, to: string, userId: number }) => {

    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }
        const isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) {
            return { message: "User not found", status: 401 }
        }
        if (!isUserExist.isVerified) {
            return { message: "Please verify your account first to get your onramp history", status: 401 }
        }

        const res = await prisma.onramptransaction.findMany({
            where: {
                AND: [
                    { userId: payload.userId },
                    {
                        startTime: {
                            gte: new Date(payload.from).toISOString(),
                            lte: new Date(payload.to).toISOString()
                        }
                    }
                ]
            },
            orderBy: { startTime: 'desc' }
        })
        const onRamps = res.map((obj) => (
            {
                time: obj.startTime,
                amount: obj.amount,
                status: obj.status,
                provider: obj.provider,
                lockedAmount: obj.lockedAmount
            }
        )
        )
        return { message: "success", status: 200, data: onRamps };
    } catch (error: any) {
        console.log("server ===>", error);
        return { message: error.message || "Something went wrong while fetching onramp transactions", status: 500, };
    }
}

export const getOnRampTransactionByDuration = async (duration: number, userId: number) => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }
        const isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) {
            return { message: "User not found. Please login first", status: 401 }
        }
        if (!isUserExist.isVerified) {
            return { message: "Please verify your account first to get your onramp history", status: 401 }
        }
        const res = await prisma.onramptransaction.findMany({
            where: {
                AND: [
                    { userId },
                    {
                        startTime: {
                            gte: new Date(new Date().setDate(new Date().getDate() - duration)).toISOString(),
                            lte: new Date(Date.now()).toISOString()
                        }
                    }
                ]
            },
            orderBy: { startTime: 'desc' }
        })
        const onRamps = res.map((obj) => (
            {
                time: obj.startTime,
                amount: obj.amount,
                status: obj.status,
                provider: obj.provider,
                lockedAmount: obj.lockedAmount
            }
        )
        )
        return { message: "success", status: 200, data: onRamps };
    } catch (error: any) {
        console.log("server ===>", error);
        return { message: error.message || "Something went wrong while fetching onramp transactions", status: 500, };
    }
}