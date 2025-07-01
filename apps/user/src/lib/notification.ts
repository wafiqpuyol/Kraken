"use server"
import { prisma } from "@repo/db/client"
import { preference, notification } from "@repo/db/type"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { redisManager } from "@repo/cache/redisManager"

export const getAllNotifications = async (): Promise<notification[] | []> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist || !isUserExist.isVerified) return []

        const cachedNotificationData = await redisManager().getCache(`${isUserExist.id}_notifications`)
        if (cachedNotificationData && (cachedNotificationData.length > 0)) {
            console.log("hot cache");
            return cachedNotificationData
        }
        console.log("hot database");
        const notifications = await prisma.notification.findMany({
            where: { userId: isUserExist.id },
            take: 10,
            orderBy: { createdAt: "desc" },
        })
        if (notifications.length > 0) {
            await redisManager().notification(`${isUserExist.id}_notifications`, JSON.stringify(notifications))
        }
        return notifications
    } catch (error) {
        console.log("getAllUnreadNotifications ===>", error)
        return []
    }
}

export const getNextUnreadNotifications = async (skipItem: number): Promise<notification[] | []> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return []

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist || !isUserExist.isVerified) return []

        const notifications = await prisma.notification.findMany({
            where: { userId: isUserExist.id },
            skip: skipItem,
            orderBy: { createdAt: "desc" },
            take: 10
        })
        return notifications
    } catch (error) {
        console.log("getNextUnreadNotifications ===>", error)
        return []
    }
}

export const totalUnreadNotificationCount = async () => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return 0

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist || !isUserExist.isVerified) return 0

        const notifications = await prisma.notification.count({ where: { userId: isUserExist.id, read: false } })
        return notifications
    } catch (error) {
        console.log("totalUnreadNotificationCount ===>", error)
        return 0
    }
}

export const totalNotificationCount = async () => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return 0

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist || !isUserExist.isVerified) return 0

        const notifications = await prisma.notification.count({ where: { userId: isUserExist.id } })
        return notifications
    } catch (error) {
        console.log("totalUnreadNotificationCount ===>", error)
        return 0
    }
}

export const notificationStatus = async () => {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return false

        let isUserExist = await redisManager().getUserField(`${session?.user?.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session?.user?.uid } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist || !isUserExist.isVerified) return false

        let preference = await redisManager().getUserField(`${session?.user?.number}_userCred`, "preference")
        if (!preference) {
            preference = await prisma.preference.findFirst({ where: { userId: isUserExist.id } }) as preference
            if (preference) await redisManager().updateUserCred(isUserExist.number.toString(), "preference", JSON.stringify(preference))
        }
        return preference.notification_status
    } catch (error) {
        console.log("notificationStatus ===>", error)
        return false
    }
}

export const updateNotification = async (payload: Partial<notification>, notificationID: number) => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { message: "Unauthorized. Please login first", status: 401, }
        let isUserExist = await redisManager().getUserField(`${session?.user?.number}_userCred`, "user")

        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) return { message: "User not found. Please login", status: 404 }

        await prisma.notification.update({
            where: { userId: isUserExist.id, id: notificationID },
            // @ts-ignore
            data: payload,
        })
        const cachedNotificationData = await redisManager().getCache(`${isUserExist.id}_notifications`)
        const updatedNotificationCache = cachedNotificationData.map((n: notification) => {
            if (n.id === notificationID) {
                console.log(n);
                n.read = true
            }
            return n
        });
        redisManager().deleteCache(`${isUserExist.id}_notifications`)
        redisManager().notification(`${session.user.uid}_notifications`, JSON.stringify(updatedNotificationCache))
        return { message: "Success", status: 200 }
    } catch (error) {
        console.log("updateNotification ===>", error)
        return { message: "Something went wrong while updating notification", status: 500 }
    }
}