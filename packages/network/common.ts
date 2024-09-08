import { prisma } from "@repo/db/client"
import { signUpPayload } from "@repo/forms/signupSchema"
import { genSalt, hash } from "bcryptjs"

const generateHash = async (rawPassword: string) => {
    return await new Promise((resolve, reject) => {
        genSalt(12, (err, salt) => {
            if (err) {
                reject(err.message)
            }
            hash(rawPassword, salt, function (err, hash) {
                if (err) {
                    reject(err.message)
                }
                resolve(hash);
            });
        })
    }) as string
}

export const signUp = async (payload: signUpPayload) => {
    const isUser = await prisma.user.findUnique({ where: { email: payload.email } })
    if (isUser) { throw new Error("User already exists") }

    payload.password = await generateHash(payload.password);
    const user = await prisma.user.create({
        data: {
            number: payload.phone_number,
            password: payload.password,
            email: payload.email,
            name: payload.name,
        }
    });
    return "Signup Successfully";
}