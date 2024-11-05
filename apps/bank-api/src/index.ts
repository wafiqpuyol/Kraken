import express from "express"
import cors from "cors"
import 'dotenv/config'
import apiRoutes from "./routes"
import { PORT } from "./config"
const main = () => {

    const app = express()
    app.use(cors({
        origin: [process.env.PRIMARY_APP_URL!, process.env.BANK_WEB_URL!],
    }))
    app.use(express.json())
    app.use("/api", apiRoutes)
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`)
    })
}
main()