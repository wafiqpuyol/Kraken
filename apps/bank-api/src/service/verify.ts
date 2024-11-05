import jwt from 'jsonwebtoken';

export const verifyService = (token: string) => {
    try {
        const res = jwt.verify(token, process.env.SECRET_KEY as string)
        return res
    } catch (error: any) {
        throw error.message
    }
}