import { genSalt, hash, compare } from "bcryptjs"

export const generateHash = async (rawPassword: string) => {
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

export function generateRandomNumber() {
    const min = 10000000
    const max = 99999999
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const comparePassword = async (currentPass: string, hashedPass: string): Promise<boolean> => {
    return await compare(currentPass, hashedPass);
}