import { Request, Response } from "express"
import { notificationService } from "../service/notification"

export const notificationController = async (req: Request, res: Response): Promise<any> => {
    try {
        const body = req.body
        await notificationService(body)
        return res.status(200).json({
            message: "Notification data successfully added to queue"
        })
    } catch (error) {
        console.log("notificationController ==>", error);
        return res
            .status(500)
            .json({ message: "Something went wrong while loading notification data to queue" })
    }
}