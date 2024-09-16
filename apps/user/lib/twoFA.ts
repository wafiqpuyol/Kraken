"use server"

import { authenticator } from "otplib";
import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"


export const getTwoFASecret = async (): Promise<{
    message?: string;
    status?: number;
    twoFactorSecret?: string | undefined
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401, }
        }

        let isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) {
            return { message: "Unauthorized User Not Found", status: 401 }
        }

        let secret = isUserExist.twoFactorSecret
        if (!secret) {
            secret = authenticator.generateSecret();
            isUserExist = await prisma.user.update({
                where: { id: session.user.uid },
                data: { twoFactorSecret: secret }
            })
        }

        return {
            status: 200,
            twoFactorSecret: authenticator.keyuri(
                session.user.email ?? "",
                "Kraken.com",
                secret
            ),
        };

    } catch (error) {
        console.log(error);
        return { message: "Something while generate 2FA secret", status: 500 }
    }
}

export const activate2fa = async (otp: string): Promise<{
    message: string;
    status: number;
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401, }
        }

        let isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) {
            return { message: "Unauthorized User Not Found", status: 401 }
        }

        if (!isUserExist.twoFactorSecret) {
            return { message: "2FA secret not present. Please try again", status: 500 }
        }

        const tokenValid = authenticator.check(otp, isUserExist.twoFactorSecret);
        if (!tokenValid) {
            return { message: "Invalid OTP. Please try again", status: 400 }
        }
        await prisma.user.update({
            where: { id: session.user.uid },
            data: { twoFactorActivated: true }
        })

        return { message: "2FA enabled successfully", status: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something while processing 2FA", status: 500 }
    }

}