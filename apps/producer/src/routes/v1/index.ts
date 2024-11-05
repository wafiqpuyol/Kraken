import express, { Router } from "express"
import { depositRouter } from "../v1/deposit"
import { notificationRouter } from "./notification"


const router: Router = express.Router()

router.use("/producer/deposits", depositRouter)
router.use("/producer/notifications", notificationRouter)

export default router