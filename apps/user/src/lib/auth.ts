"use server"

import { generateHash, generateRandomNumber, comparePassword } from "@repo/network"
import { prisma } from "@repo/db/client"
import { signUpPayload } from "@repo/forms/signupSchema"
import { ChangePasswordSchema, changePasswordPayload } from "@repo/forms/changePasswordSchema"
import { ForgotPasswordSchema, forgotPasswordPayload } from "@repo/forms/forgotPasswordSchema"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "./mail"
import { resetPasswordPayload } from "@repo/forms/resetPasswordSchema"
import { PasswordMatchSchema } from "@repo/forms/changePasswordSchema"

export const signUpAction = async (payload: signUpPayload, countryName: string): Promise<{ message: string, status: number }> => {
    try {
        const isUser = await prisma.user.findUnique({ where: { email: payload.email } })
        if (isUser) {
            return { message: "User already exist", status: 409 }
        }

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
            console.log("Signup ------->", user);
            await prisma.balance.create({
                data: {
                    amount: 0,
                    locked: 0,
                    userId: user.id,
                }
            })
            await prisma.preference.create({
                data: {
                    userId: user.id
                }
            })
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

        const isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
        if (!isUserExist) {
            return { message: "Unauthorized. Please login first to change password", status: 401 }
        }
        const isPasswordMatch = await comparePassword(payload.currentPassword, isUserExist.password)
        if (!isPasswordMatch) {
            return { message: "Current password is incorrect", status: 401 }
        }

        await prisma.user.update({
            where: {
                id: session.user.uid
            },
            data: {
                password: await generateHash(payload.newPassword)
            }
        })
        return { message: "Password changed successfully", status: 201 }

    } catch (error) {
        return { message: "Something went wrong while changing password", status: 500 }
    }
}

export const forgotPasswordAction = async (payload: forgotPasswordPayload): Promise<{ message: string, status: number }> => {
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

        const isUserExist = await prisma.user.findUnique({ where: { email: payload.email } })
        if (!isUserExist) {
            return { message: "User with this email does not exist", status: 404 }
        }

        const passwordResetToken = randomBytes(32).toString("hex");
        const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1)

        await prisma.resetpassword.create({
            data: {
                userId: isUserExist.id,
                token: passwordResetToken,
                tokenExpiry
            }
        })

        return await sendVerificationEmail(payload.email, passwordResetToken)
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
            where: {
                AND: [
                    { userId: session?.user?.uid },
                    { token }
                ]
            }
        })

        const now = new Date();
        if (resetPasswordTableData) {
            if (resetPasswordTableData.token !== token) {
                return { message: "Invalid token. Please try again", status: 401 }
            }
            if (now > resetPasswordTableData?.tokenExpiry) {
                return { message: "Token has expired. Please try again", status: 401 }
            }
        }

        await prisma.user.update({
            where: {
                id: resetPasswordTableData?.userId
            },
            data: {
                password: await generateHash(payload.newPassword)
            }
        })
        return { message: "Password reset successfully", status: 201 }

    } catch (error) {
        console.log("reset password error ----->", error);
        return { message: "Something went wrong while resetting password", status: 500 }
    }
}