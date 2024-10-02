"use server"

import { generateHash, generateRandomNumber, comparePassword } from "@repo/network"
import { prisma } from "@repo/db/client"
import { signUpPayload, SignUpSchema } from "@repo/forms/signupSchema"
import { ChangePasswordSchema, changePasswordPayload } from "@repo/forms/changePasswordSchema"
import { ForgotPasswordSchema, forgotPasswordPayload } from "@repo/forms/forgotPasswordSchema"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { randomBytes } from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mail"
import { resetPasswordPayload } from "@repo/forms/resetPasswordSchema"
import { PasswordMatchSchema } from "@repo/forms/changePasswordSchema"
import { SUPPORTED_CURRENCY } from "./constants"

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

            const currency = SUPPORTED_CURRENCY.find((c) => (c.country === countryName) || "USD")?.name!
            await prisma.balance.create({
                data: {
                    amount: 0,
                    locked: 0,
                    userId: user.id,
                    currency: currency
                }
            })
            await prisma.preference.create({
                data: {
                    userId: user.id,
                    currency
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

        const isUserExist = await prisma.user.findUnique({ where: { id: session.user.uid } })

        if (!isUserExist) {
            return { message: "User with this email does not exist", status: 404 }
        }

        const payload = {
            verificationToken: randomBytes(32).toString("hex"),
            verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }
        await prisma.user.update({ where: { id: isUserExist.id }, data: payload })
        console.log(payload.verificationToken);
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
    console.log(token);
    try {
        if (!token) {
            return { message: "Token is missing", status: 401 }
        }
        const now = new Date();
        const isUserExist = await prisma.user.findFirst({ where: { verificationToken: token } })

        if (!isUserExist) {
            return { message: "User with this email does not exist", status: 404 }
        }
        if (isUserExist.verificationToken !== token) {
            return { message: "Invalid token", status: 400 }
        }
        if (now > isUserExist.verificationTokenExpiresAt!) {
            return { message: "Token has expired", status: 401 }
        }
        const payload = {
            isVerified: true,
            verificationToken: "",
            verificationTokenExpiresAt: null
        }
        await prisma.user.update({ where: { id: isUserExist.id }, data: payload })
        return { message: "Email verification successful", status: 200 }
    } catch (error: any) {
        console.log("------> verifyEmail", error);
        return { message: error.message || "Something went wrong while verifying your email", status: 500 }
    }
}