import 'dotenv/config'
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'

export const generateToken = (uId: string) => {
    return jwt.sign({ data: uId }, process.env.SECRET_KEY as string, { expiresIn: '3min' })
}

export const decoode = (token: string) => {
    try {
        const res = jwt.verify(token, process.env.SECRET_KEY as string)
        console.log("Response--->", res);
        return res
    } catch (error: any) {
        throw error.message
    }
}