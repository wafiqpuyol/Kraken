"use server"

import { generateHash, generateRandomNumber, comparePassword } from "@repo/network"
import { prisma } from "@repo/db/client"
import { signUpPayload } from "@repo/forms/signupSchema"
import { ChangePasswordSchema, changePasswordPayload } from "@repo/forms/changePasswordSchema"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"

export const signUpAction = async (payload: signUpPayload): Promise<{ message: string, status: number }> => {
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
                }
            });
            await prisma.balance.create({
                data: {
                    amount: 0,
                    locked: 0,
                    userId: user.id,
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