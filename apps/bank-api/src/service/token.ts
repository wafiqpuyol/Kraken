import jwt from 'jsonwebtoken';

export const tokenService = (uId: string) => {
    return jwt.sign({ data: uId }, process.env.SECRET_KEY as string, { expiresIn: '3min' })
}