import { Request, Response } from "express";
import { tokenService } from "../service/token"

export const tokenController = async (req: Request, res: Response): Promise<any> => {
    const uId = req.body.uid;
    const transactionToken = tokenService(uId)
    return res
        .status(200)
        .json({ token: transactionToken })
}