import express from "express";
import cors from "cors";
import { prisma } from "@repo/db/client"
import { IWebhookPayload } from "./type"
import { PORT } from "./config"

const app = express()

app.use(express.json())
app.use(cors({ origin: ["http://localhost:3001"] }))


app.post("/api/v1/webhook", async (req, res) => {
    try {
        const payload: IWebhookPayload = req.body;
        await prisma.$transaction([
            prisma.balance.update({
                where: {
                    userId: payload.userId
                },
                data: {
                    amount: {
                        increment: (payload.amount - payload.lockedAmount)
                    },
                    locked: {
                        increment: payload.lockedAmount
                    }
                }
            }),
            prisma.onramptransaction.update({
                where: {
                    token: payload.token
                },
                data: {
                    status: payload.tokenValidation,
                }
            })
        ]);

        res.json({
            message: "Successful"
        })
    } catch (error) {
        console.log("----------------->", error);
        return res.json({ message: "Payment failed" })
    }
})


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})