"use server"

import { generateHash, generateRandomNumber } from "@repo/network"
import { prisma } from "@repo/db/client"
import { signUpPayload } from "@repo/forms/signupSchema"

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