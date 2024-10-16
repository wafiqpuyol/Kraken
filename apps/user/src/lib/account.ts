"use server"

import { prisma } from "@repo/db/client"
import { account } from "@repo/db/type"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"

export const checkAccountLockStatus = async (): Promise<{ message: string, status: number, isLock?: boolean, lockExpiry?: Date | null }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }
        const isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) return { message: "User not found. Please login", status: 401 }
        if (!isUserExist.isVerified) return { message: "Please verify your account first to send money", status: 401 }

        const account = await prisma.account.findFirst({ where: { userId: session.user.uid } }) as account

        return { message: "ok", status: 200, isLock: account.isLock, lockExpiry: account.lock_expiresAt }
    } catch (error) {
        console.log("isAccountLock ===>", error);
        return { message: "Something went wrong while verifying account lock status. Please try again", status: 500 }
    }
}

export const updateLockStatus = async () => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return
        }
        await prisma.account.update({ where: { userId: session.user.uid }, data: { isLock: false, lock_expiresAt: null } })
        await prisma.wallet.update({ where: { userId: session.user.uid }, data: { wrongPincodeAttempts: 0 } })
    } catch (error) {
        console.log("updateLockStatus ===>", error);
    }
}