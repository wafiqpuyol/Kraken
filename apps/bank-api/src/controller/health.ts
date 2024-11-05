import { Request, Response } from "express";

export const healthController = async (req: Request, res: Response): Promise<any> => {
    res
        .status(200)
        .send("Server is running")
}