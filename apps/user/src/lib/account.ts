"use server"

import { prisma } from "@repo/db/client"
import { account } from "@repo/db/type"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { redisManager } from "@repo/cache/redisManager"
import { WRONG_PINCODE_ATTEMPTS } from "@repo/ui/constants"

export const checkAccountLockStatus = async (): Promise<{ message: string, status: number, isLock?: boolean, lockExpiry?: Date | null }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }
        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) return { message: "User not found. Please login", status: 401 }
        if (!isUserExist.isVerified) return { message: "Please verify your account.", status: 401 }

        const cachedWalletLockData = await redisManager().getCache(`${session.user.uid}_walletLock`)
        if (cachedWalletLockData) {
            return { message: "ok", status: 200, isLock: cachedWalletLockData.failedAttempt === WRONG_PINCODE_ATTEMPTS, lockExpiry: cachedWalletLockData.lockExpiresAt }
        }
        let account = await redisManager().getUserField(`${session.user.number}_userCred`, "account")
        if (!account) {
            account = await prisma.account.findFirst({ where: { userId: session.user.uid } }) as account
            await redisManager().updateUserCred(session.user.number.toString(), "account", JSON.stringify(account))
        }
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
        if (await redisManager().getCache(`${session.user.uid}_walletLock`)) {
            await redisManager().deleteCache(`${session.user.uid}_walletLock`)
        }
        await prisma.account.update({ where: { userId: session.user.uid }, data: { isLock: false, lock_expiresAt: null } })
        await prisma.wallet.update({ where: { userId: session.user.uid }, data: { wrongPincodeAttempts: 0 } })
    } catch (error) {
        console.log("updateLockStatus ===>", error);
    }
}
export const updateAccount = async (update: Partial<account>) => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return
        }
        // @ts-ignore
        const updatedAccountInfo = await prisma.account.update({ where: { userId: session.user.uid }, data: { ...update } })
        await redisManager().updateUserCred(session.user.number.toString(), "account", JSON.stringify(updatedAccountInfo))
    } catch (error) {
        console.log("updateAccount ===>", error);
    }
}