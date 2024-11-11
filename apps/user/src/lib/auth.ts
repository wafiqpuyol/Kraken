"use server"

import { generateHash, generateRandomNumber, comparePassword } from "@repo/network"
import { prisma } from "@repo/db/client"
import { signUpPayload, SignUpSchema } from "@repo/forms/signupSchema"
import { ChangePasswordSchema, changePasswordPayload } from "@repo/forms/changePasswordSchema"
import { ForgotPasswordSchema, forgotPasswordPayload } from "@repo/forms/forgotPasswordSchema"
import { ConfirmMailSchema, confirmMailPayload } from "@repo/forms/confirmMailSchema"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { randomBytes } from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail, sendChangeEmailVerification } from "./mail"
import { resetPasswordPayload } from "@repo/forms/resetPasswordSchema"
import { PasswordMatchSchema } from "@repo/forms/changePasswordSchema"
import { SUPPORTED_CURRENCY } from "@repo/ui/constants"
import { verify, sign, JwtPayload } from "jsonwebtoken"
import { generateToken } from "./utils"
import { redisManager } from "@repo/cache/redisManager"
import { user } from "@repo/db/type"

export const signUpAction = async (payload: signUpPayload, countryName: string): Promise<{ message: string, status: number }> => {
    try {
        const validatedPayload = SignUpSchema.safeParse(payload)
        if (!validatedPayload.success) {
            return {
                message: (validatedPayload.error.format().email?._errors[0]
                    ||
                    validatedPayload.error.format().name?._errors[0] as string
                    ||
                    validatedPayload.error.format().phone_number?._errors[0]
                    ||
                    validatedPayload.error.format().password?._errors[0]) as string,
                status: 400,
            }
        }


        let isUserWithSameEmailExist = (await redisManager().getUserField(`${payload.phone_number}_userCred`, "user"))?.email ?? null
        if (isUserWithSameEmailExist) return { message: "User already exist with this email", status: 409 }
        let isUserWithSameNumberExist = (await redisManager().getUserField(`${payload.phone_number}_userCred`, "user"))?.number ?? null
        if (isUserWithSameNumberExist) return { message: "User already exist with phone number already exist", status: 409 }


        payload.password = await generateHash(payload.password);
        await prisma.$transaction(async () => {
            const user = await prisma.user.create({
                data: {
                    id: generateRandomNumber(),
                    number: payload.phone_number,
                    password: payload.password,
                    email: payload.email,
                    name: payload.name,
                    country: countryName
                }
            });
            await redisManager().addUser(user);
            const currency = SUPPORTED_CURRENCY.find((c) => (c.country === countryName))?.name || "USD"
            const userBalance = await prisma.balance.create({
                data: {
                    amount: 0,
                    locked: 0,
                    userId: user.id,
                    currency: currency
                }
            })
            await redisManager().updateUserCred(user.number.toString(), "balance", JSON.stringify(userBalance))
            const userPreference = await prisma.preference.create({
                data: {
                    userId: user.id,
                    currency
                }
            })
            redisManager().updateUserCred(user.number.toString(), "preference", JSON.stringify(userPreference))
            const userAccount = await prisma.account.create({
                data: {
                    current_email: user.email!,
                    userId: user.id,
                    email_update: JSON.stringify({}),
                }
            })
            redisManager().updateUserCred(user.number.toString(), "account", JSON.stringify(userAccount))
        })
        return { message: "Signup Successful", status: 201 }
    } catch (error: any) {
        console.log("===========================>", error.message);
        return { message: error.message || "Signup Failed. Something went wrong", status: 500 }
    }
}

export const changePasswordAction = async (payload: changePasswordPayload): Promise<{ message: string | undefined, status: number }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first to change password", status: 401 }
        }
        const validatedPayload = ChangePasswordSchema.safeParse(payload)

        if (!validatedPayload.success) {
            return {
                message: validatedPayload.error.format().currentPassword?._errors[0] || validatedPayload.error.format().newPassword?._errors[0] || validatedPayload.error.format().ConfirmPassword?._errors[0],
                status: 400,
            }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) {
            return { message: "Unauthorized. Please login first to change password", status: 401 }
        }
        const isPasswordMatch = await comparePassword(payload.currentPassword, isUserExist.password)
        if (!isPasswordMatch) {
            return { message: "Current password is incorrect", status: 401 }
        }

        const isWalletExist = await prisma.wallet.findFirst({ where: { userId: isUserExist.id } })
        let decodedPincode: null | string | JwtPayload = null
        if (isWalletExist && isWalletExist.pincode) {
            decodedPincode = verify(isWalletExist.pincode, isUserExist.password)
        }

        const updatedUserData = await prisma.user.update({
            where: {
                id: session.user.uid
            },
            data: {
                password: await generateHash(payload.newPassword)
            }
        })
        await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(updatedUserData))

        if (decodedPincode !== null) {
            const encryptedPin = sign(decodedPincode, updatedUserData.password)
            await prisma.wallet.update({ where: { userId: isUserExist.id }, data: { pincode: encryptedPin } })
        }
        return { message: "Password changed successfully", status: 201 }

    } catch (error) {
        return { message: "Something went wrong while changing password", status: 500 }
    }
}

export const forgotPasswordAction = async (payload: forgotPasswordPayload, locale: string): Promise<{ message: string, status: number }> => {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.uid) {
            return { message: "You're already logged in with this account", status: 409 }
        }
        const validatedPayload = ForgotPasswordSchema.safeParse(payload)
        if (!validatedPayload.success) {
            return {
                message: validatedPayload.error.format().email?._errors[0] as string,
                status: 400,
            }
        }

        let isUserExist = await redisManager().getUserField(`${session?.user?.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findUnique({ where: { email: payload.email } })
            redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) {
            return { message: "Password reset link has been sent to your email", status: 200 };
        }

        const passwordResetToken = await generateToken();
        const tokenExpiry = new Date(Date.now() + 1000 * 60 * 10)
        const existingResetPasswordEntry = await prisma.resetpassword.findFirst({
            where: {
                userId: isUserExist.id
            }
        })

        if (existingResetPasswordEntry) {
            await prisma.resetpassword.deleteMany({ where: { userId: isUserExist.id } })
        }
        await prisma.resetpassword.create({
            data: {
                userId: isUserExist.id,
                token: passwordResetToken,
                tokenExpiry
            }
        })
        return await sendPasswordResetEmail(payload.email, passwordResetToken, locale)
    } catch (error: any) {
        console.log("forgotPasswordAction ---->", error.message);
        return { message: "Something went wrong while resetting password", status: 500 }
    }
}

export const resetPasswordAction = async (payload: resetPasswordPayload, token: string | undefined): Promise<{ message: string | undefined, status: number }> => {
    try {
        if (!token) {
            return { message: "Token is missing", status: 401 }
        }
        const session = await getServerSession(authOptions)
        if (session?.user?.uid) {
            return { message: "You're already logged in with this account", status: 409 }
        }

        const validatedPayload = PasswordMatchSchema.safeParse(payload)
        if (!validatedPayload.success) {
            return {
                message: validatedPayload.error.format().newPassword?._errors[0] || validatedPayload.error.format().ConfirmPassword?._errors[0],
                status: 400,
            }
        }

        const resetPasswordTableData = await prisma.resetpassword.findFirst({
            where: { token }
        })
        if (!resetPasswordTableData) {
            return { message: "Invalid token. Please request a new mail to reset", status: 401 }
        }
        const now = new Date();
        if (resetPasswordTableData) {
            if (resetPasswordTableData.token !== token) {
                return { message: "Invalid token. Please request a new mail to reset", status: 401 }
            }
            if (now > resetPasswordTableData?.tokenExpiry!) {
                await prisma.resetpassword.delete({ where: { id: resetPasswordTableData.id } })
                return { message: "Token has expired. Please request a new mail to reset", status: 401 }
            }
        }

        await prisma.$transaction(async () => {
            const user = await prisma.user.findFirst({ where: { id: resetPasswordTableData.userId } }) as user
            const isWalletExist = await prisma.wallet.findFirst({ where: { userId: user.id } })
            let decodedPincode: null | string | JwtPayload = null
            if (isWalletExist && isWalletExist.pincode) {
                decodedPincode = verify(isWalletExist.pincode, user.password)
            }
            const updatedUserData = await prisma.user.update({
                where: {
                    id: resetPasswordTableData.userId
                },
                data: {
                    password: await generateHash(payload.newPassword)
                }
            })
            await redisManager().updateUserCred(updatedUserData.number.toString(), "user", JSON.stringify(updatedUserData))

            if (decodedPincode !== null) {
                const encryptedPin = sign(decodedPincode, updatedUserData.password)
                await prisma.wallet.update({ where: { userId: user.id }, data: { pincode: encryptedPin } })
            }
            await prisma.resetpassword.delete({
                where: {
                    id: resetPasswordTableData.id
                }
            })
        })

        return { message: "Password reset successful", status: 201 }

    } catch (error) {
        console.log("reset password error ----->", error);
        return { message: "Something went wrong while resetting password", status: 500 }
    }
}

export const sendVerificationEmailAction = async (locale: string): Promise<{ message: string, status: number }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findUnique({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) {
            return { message: "User with this email does not exist", status: 404 }
        }

        const payload = {
            verificationToken: await generateToken(),
            verificationTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        }
        const updatedUserInfo = await prisma.user.update({ where: { id: isUserExist.id }, data: payload })
        await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(updatedUserInfo))
        return await sendVerificationEmail(isUserExist.email!, payload.verificationToken, locale)
    } catch (error) {
        console.log("sendVerificationEmailAction", error);
        return { message: "Something went wrong while sending email verification", status: 500 }
    }
}

export const verifyEmail = async (token: string): Promise<{
    message: string;
    status: number;
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }
        if (!token) {
            return { message: "Token is missing", status: 401 }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { verificationToken: token } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) {
            return { message: "User with this email does not exist", status: 404 }
        }
        if (isUserExist.verificationToken !== token) {
            return { message: "Invalid token", status: 400 }
        }

        const now = new Date();
        if (now > isUserExist.verificationTokenExpiresAt!) {
            return { message: "Token has expired. Please request a new verification mail", status: 401 }
        }

        const payload = {
            isVerified: true,
            verificationToken: "",
            verificationTokenExpiresAt: null
        }
        const updatedUserInfo = await prisma.user.update({ where: { id: isUserExist.id }, data: payload })
        await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(updatedUserInfo))

        return { message: "Email verification successful", status: 200 }
    } catch (error: any) {
        console.log("------> verifyEmail", error);
        return { message: error.message || "Something went wrong while verifying your email", status: 500 }
    }
}

export const changeEmailAction = async (payload: forgotPasswordPayload): Promise<{ message: string, status: number }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first to change your email.", status: 401 }
        }
        const validatedPayload = ForgotPasswordSchema.safeParse(payload)
        if (!validatedPayload.success) {
            return {
                message: validatedPayload.error.format().email?._errors[0] as string,
                status: 400,
            }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        const isEmailExist = await prisma.user.findUnique({ where: { email: payload.email } })
        if (isEmailExist) {
            return { message: "Email already exists. Try to choose different email", status: 409 }
        }

        const updated = {
            email_update_pending: true,
            userId: session.user.uid,
            email_update: JSON.stringify({
                email_address: payload.email,
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            }),
            authorization_code: randomBytes(16).toString("hex"),
            confirmation_code: randomBytes(16).toString("hex")
        }

        const updatedAccountInfo = await prisma.account.update({ where: { userId: session.user.uid }, data: updated })
        await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(updatedAccountInfo))

        await sendChangeEmailVerification(isUserExist.email!, payload.email, updated.authorization_code, updated.confirmation_code)
        return { message: "Email change request sent successfully", status: 200 }
    } catch (error: any) {
        console.log("changeEmailAction", error);
        return { message: error.message || "Something went wrong while sending email change request", status: 500 }
    }
}

export const updateEmail = async (payload: confirmMailPayload): Promise<{ message: string, status: number }> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first to change your email.", status: 401 }
        }
        const validatedPayload = ConfirmMailSchema.safeParse(payload)
        if (!validatedPayload.success) {
            return {
                message: validatedPayload.error.format().authorization_code?._errors[0] as string || validatedPayload.error.format().confirmation_code?._errors[0] as string,
                status: 400,
            }
        }
        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        const isAccountExist = await prisma.account.findFirst({
            where: {
                AND: [
                    { userId: isUserExist.id },
                    { authorization_code: payload.authorization_code },
                    { confirmation_code: payload.confirmation_code }
                ]
            }
        })

        if (!isAccountExist) {
            return { message: "Invalid confirmation or authorization code", status: 400 }
        }

        const newEmail = JSON.parse(isAccountExist.email_update!.toLocaleString());

        const updatedUserInfo = await prisma.user.update({ where: { id: session.user.uid }, data: { email: newEmail.email_address } })
        await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(updatedUserInfo))
        const updatedAccountInfo = await prisma.account.update({
            where: { userId: isUserExist.id }, data: {
                authorization_code: null,
                confirmation_code: null,
                current_email: newEmail.email_address,
                email_update_pending: false,
                email_update: JSON.stringify({})
            }
        })
        await redisManager().updateUserCred(session.user.number.toString(), "account", JSON.stringify(updatedAccountInfo))

        return { message: "Email changed successfully", status: 200 }
    } catch (error: any) {
        console.log("updateEmail", error);
        return { message: error.message || "Something went wrong while updating your email", status: 500 }
    }
}

export const cancelConfirmMail = async (): Promise<{
    message: string;
    status: number;
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first to change your email.", status: 401 }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session?.user.uid } }) as user
            if (isUserExist) await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(isUserExist))
        }

        const updatedUserInfo = await prisma.account.update({
            where: {
                userId: isUserExist.id,
            },
            data: {
                authorization_code: null,
                confirmation_code: null,
                email_update_pending: false,
                email_update: JSON.stringify({}),
            }
        })
        await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(updatedUserInfo))

        return { message: "Email change request canceled successfully", status: 200 }
    } catch (error) {
        console.log("cancelConfirmMail -->", error);
        return { message: "Something went wrong while canceling email change request", status: 500 }
    }
} 