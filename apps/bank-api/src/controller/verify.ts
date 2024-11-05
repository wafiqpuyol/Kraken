import { Request, Response } from "express";
import { verifyService } from "../service/verify"

export const verifyController = async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.body.token) {
            return res
                .status(400)
                .json({ message: "Token is missing" })
        }
        const result = verifyService(req.body.token)
        return res.json({ token: result })
    } catch (error) {
        if (error === "jwt expired") {
            return res
                .status(401)
                .json({ message: "Token has expired. Please go back to your wallet and try again" });
        }
        if (error === "jwt malformed") {
            return res
                .status(400)
                .json({ message: error });
        } else {
            return res
                .status(500)
                .json({ message: "Something went wrong while verifying your token" });
        }
    }
}