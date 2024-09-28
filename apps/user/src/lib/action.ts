"use server"
import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { preference } from "@repo/db/type"

export const updatePreference = async (payload: Partial<preference>): Promise<{
    message: string;
    statusCode: number;
    updatedPreference?: preference
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return { message: "unauthenticated", statusCode: 401 }
        const isUserExist = await prisma.user.findUnique({
            where:
                { number: session.user.number },
            include: {
                preference: true
            }
        })
        if (!isUserExist) return { message: "User not found. Please login", statusCode: 404 }
        const updatedPreference = await prisma.preference.update({ where: { id: isUserExist.preference?.id, userId: isUserExist.id }, data: payload })
        return { message: "success", statusCode: 200, updatedPreference }
    } catch (error) {
        console.log(error)
        return { message: "Something went wrong", statusCode: 500 }
    }
}