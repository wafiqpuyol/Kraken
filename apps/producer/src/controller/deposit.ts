import { Request, Response } from "express"
import { depositService } from "../service/deposit"


export const depositController = async (req: Request, res: Response): Promise<any> => {
    try {
        const body = req.body
        await depositService(body)
        return res
            .status(200)
            .json({
                message: "Deposit data successfully added to queue"
            })
    } catch (error) {
        console.log("depositController ==>", error);
        return res
            .status(500)
            .json({
                message: "Something went wrong while loading deposit data to queue"
            })
    }
}