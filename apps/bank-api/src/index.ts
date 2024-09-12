import express from "express"
import cors from "cors"
import type { Request, Response } from "express"
import { PORT } from "./config"
import { generateToken, decoode } from "./routes/token"
const app = express()
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
}))

app.get("/", (req: Request, res: Response) => res.send("Hello World"))

app.post("/api/v1/token", (req: Request, res: Response) => {
    const uId = req.body.uid;
    const transactionToken = generateToken(uId)
    return res.status(200).json({ token: transactionToken })
})

app.post("/api/v1/verify", (req: Request, res: Response) => {
    //@ts-ignore
    try {
        const result = decoode(req.body.token)
        return res.json({ token: result })

    } catch (error) {
        if (error === "jwt malformed") {
            return res.status(400).json({ message: error });
        } else {
            return res.status(500).json({ message: "Something went wrong" });
        }
    }
})
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})