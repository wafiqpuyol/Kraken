"use server"

import { authenticator } from "otplib";
import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { user } from "@repo/db/type";
import { redisManager } from "@repo/cache/redisManager"

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

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) {
            return { message: "Unauthorized User Not Found", status: 401 }
        }
        if (!isUserExist.isVerified) {
            return { message: "Please verify your account first before enable signIn2FA.", status: 401 }
        }

        let secret = isUserExist.twoFactorSecret
        if (!secret) {
            secret = authenticator.generateSecret();
            const updatedUserInfo = isUserExist = await prisma.user.update({
                where: { id: session.user.uid },
                data: { twoFactorSecret: secret }
            })
            await redisManager().updateUserCred(updatedUserInfo.number.toString(), "user", JSON.stringify(updatedUserInfo))
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

export const activate2fa = async (otp: string, twoFAType: "signInTwoFA" | "withDrawTwoFA" | "masterKeyTwoFA"): Promise<{
    message: string;
    status: number;
}> => {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401, }
        }
        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) {
            return { message: "Unauthorized User Not Found", status: 401 }
        }

        let secret: string | null = null;
        if (twoFAType === "signInTwoFA" || twoFAType === "masterKeyTwoFA") {
            if (!isUserExist.twoFactorSecret) {
                // To enable/activate master key, user must enable signin 2fa
                // return { message: "2FA secret not present. Please try again", status: 500 } //Previous message
                return { message: "Please enable signin 2FA to activate master key", status: 401 } //Updated message
            }
            secret = isUserExist.twoFactorSecret
        }
        if (twoFAType === "withDrawTwoFA") {
            let isWalletExist = await prisma.wallet.findFirst({ where: { userId: session.user.uid } })
            if (!isWalletExist) {
                return { message: "Wallet associated with this user not found", status: 401 }
            } else {
                // if (!isWalletExist.withDrawTwoFAActivated || !isWalletExist.withDrawTwoFASecret) {
                if (!isWalletExist.withDrawTwoFASecret) {
                    return { message: "WithDrawTwoFA secret not present. Please try again", status: 500 }
                }
            }
            secret = isWalletExist.withDrawTwoFASecret
        }

        const tokenValid = authenticator.check(otp, secret!);
        if (!tokenValid) {
            return { message: "Invalid OTP. Please try again", status: 400 }
        }

        if (twoFAType === "signInTwoFA") {
            const updatedUserInfo = await prisma.user.update({
                where: { id: session.user.uid },
                data: { twoFactorActivated: true, otpVerified: true }
            })
            await redisManager().updateUserCred(updatedUserInfo.number.toString(), "user", JSON.stringify(updatedUserInfo))
        }
        if (twoFAType === "withDrawTwoFA") {
            await prisma.wallet.update({
                where: { userId: session.user.uid },
                data: { withDrawOTPVerified: true, withDrawTwoFAActivated: true }
            })
        }
        if (twoFAType === "masterKeyTwoFA") {
            await prisma.masterkey.update({ where: { userId: session.user.uid }, data: { otpVerified: true } })
        }

        let message = ""
        if (twoFAType === "signInTwoFA") message = "SignInTwoFA enabled successfully"
        if (twoFAType === "withDrawTwoFA") message = "WithDrawTwoFA enabled successfully"
        if (twoFAType === "masterKeyTwoFA") message = "OTP verified successfully"

        return { message, status: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something while verifying 2FA", status: 500 }
    }
}

// @ts-ignore
export const isTwoFAEnabled = async (): Promise<{ message: string, status: number, isTwoFAEnabled?: boolean, isOTPVerified?: boolean }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first.", status: 401 }
        }
        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session?.user?.uid } }) as user
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist.twoFactorSecret) {
            return { message: "success", status: 200, isTwoFAEnabled: false, isOTPVerified: false }
        }
        return { message: "success", status: 200, isTwoFAEnabled: isUserExist.twoFactorActivated, isOTPVerified: isUserExist.otpVerified }
    } catch (error: any) {
        console.log("===========================>", error.message);
        return { message: error.message || "Signup Failed. Something went wrong", status: 500 }
    }
}

export const disable2fa = async (twoFAType: "signInTwoFA" | "withDrawTwoFA", uid?: number) => {
    const session = await getServerSession(authOptions)

    if (twoFAType === "signInTwoFA") {
        if (!session?.user?.uid && !uid) {
            return
        }
        let isUserExist = await redisManager().getUserField(`${session?.user?.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: uid || session?.user?.uid } })
        }

        if (!isUserExist) return;
        if (isUserExist.otpVerified) {
            await prisma.user.update({
                where: {
                    id: uid || session?.user?.uid
                },
                data: {
                    otpVerified: false
                }
            })
        }
    }
    else {
        if (!session?.user?.uid) {
            return
        }
        const wallet = await prisma.wallet.findFirst({ where: { userId: session?.user?.uid } })
        if (!wallet) return
        if (wallet.otpVerified) {
            await prisma.wallet.update({
                where: {
                    userId: session?.user?.uid
                },
                data: {
                    withDrawOTPVerified: false
                }
            })
        }
    }
}

export const getWithDrawTwoFASecret = async (): Promise<{
    message?: string;
    status: number;
    withDrawTwoFASecret?: string | undefined
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401, }
        }
        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) {
            return { message: "Unauthorized User Not Found", status: 401 }
        }

        if (!isUserExist.isVerified) {
            return { message: "Please verify your account first before enable WithDraw2FA.", status: 401 }
        }
        if (!isUserExist.twoFactorActivated) {
            return { message: "signin 2FA is not active. Please active your signin 2FA first", status: 401 }
        }

        if (!isUserExist.otpVerified) {
            return { message: "signin 2FA is not active. Please active your signin 2FA first", status: 401 }
        }

        let isWalletExist = await prisma.wallet.findFirst({ where: { userId: session.user.uid } })
        let secret = isWalletExist?.withDrawTwoFASecret ?? null
        if (!isWalletExist) {
            secret = authenticator.generateSecret();
            isWalletExist = await prisma.wallet.create({
                data: { userId: session.user.uid, withDrawTwoFASecret: secret }
            })
        }
        if (!secret) {
            secret = authenticator.generateSecret();
            isWalletExist = await prisma.wallet.update({
                where: { userId: session.user.uid },
                data: { withDrawTwoFASecret: secret }
            })
        }

        return {
            status: 200,
            withDrawTwoFASecret: authenticator.keyuri(
                session.user.email ?? "",
                "Kraken.com",
                secret
            ),
        };
    } catch (error) {
        console.log("getWithDrawTwoFASecret ==>", error);
        return { message: "Something went wrong while generating withDrawTwoFA secret", status: 500 }
    }
}

export const remove2fa = async (twoFAType: "signInTwoFA" | "withDrawTwoFA"): Promise<{
    message: string;
    status: number;
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        const isMasterKeyExist = await prisma.masterkey.findFirst({ where: { userId: session.user.uid } })
        if (!isMasterKeyExist?.passKeyActivated || (isMasterKeyExist?.passKeyActivated && !isMasterKeyExist?.passkeyVerified)) {
            return { message: `MasterKey is not activated or verified yet. Please activate or verify your MasterKey first to remove ${twoFAType}`, status: 401 }
        }

        if (twoFAType === "signInTwoFA") {
            let isUserExist = await redisManager().getUserField(`${session?.user?.number}_userCred`, "user")
            if (!isUserExist) {
                isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
                if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
            }
            if (!isUserExist) return { message: "Unauthorized User Not Found", status: 401 }
            const updatedUserInfo = await prisma.user.update({
                where: {
                    id: session.user.uid
                },
                data: {
                    twoFactorActivated: false,
                    twoFactorSecret: null,
                    otpVerified: false
                }
            })
            await redisManager().updateUserCred(updatedUserInfo.number.toString(), "user", JSON.stringify(updatedUserInfo))
        }
        else {
            const wallet = await prisma.wallet.findFirst({ where: { userId: session.user.uid } })
            if (!wallet) return { message: "Wallet associated with user not found", status: 401 }
            await prisma.wallet.update({
                where: {
                    userId: session.user.uid
                },
                data: {
                    withDrawOTPVerified: false,
                    withDrawTwoFASecret: null,
                    wrongPincodeAttempts: 0,
                    withDrawTwoFAActivated: false
                }
            })
        }
        return { message: `${twoFAType} removed successfully`, status: 201 }
    } catch (error) {
        console.log("remove2fa ==>", error);
        return { message: `Something went wrong while removing ${twoFAType}`, status: 500 }
    }
}