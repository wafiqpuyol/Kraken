"use server"

import { authenticator } from "otplib";
import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { user } from "@repo/db/type";


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
        console.log("verifiies ----->", isUserExist, session);
        await prisma.user.update({
            where: { id: session.user.uid },
            data: { twoFactorActivated: true, otpVerified: true }
        })

        return { message: "2FA enabled successfully", status: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something while processing 2FA", status: 500 }
    }

}

// @ts-ignore
export const isTwoFAEnabled = async (): Promise<{ message: string, status: number, isTwoFAEnabled?: boolean, isOTPVerified?: boolean }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first to change password", status: 401 }
        }
        const isTwoFAEnable = await prisma.user.findFirst({ where: { id: session?.user?.uid } }) as user
        console.log(isTwoFAEnable);
        if (!isTwoFAEnable.twoFactorSecret) {
            return { message: "success", status: 200, isTwoFAEnabled: false, isOTPVerified: false }
        }
        return { message: "success", status: 200, isTwoFAEnabled: isTwoFAEnable.twoFactorActivated, isOTPVerified: isTwoFAEnable.otpVerified }
    } catch (error: any) {
        console.log("===========================>", error.message);
        return { message: error.message || "Signup Failed. Something went wrong", status: 500 }
    }
}

export const disable2fa = async () => {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
        return
    }
    const user = await prisma.user.findFirst({ where: { id: session.user.uid } })
    if (!user) return
    if (user.otpVerified) {
        await prisma.user.update({
            where: {
                id: session.user.uid
            },
            data: {
                otpVerified: false
            }
        })
    }
}