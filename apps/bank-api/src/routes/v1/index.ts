import express, { Router } from "express"
import { healthRouter } from "./health"
import { verifyRouter } from "./verify"
import { tokenRouter } from "./token"


const router: Router = express.Router()

router.use("/health", healthRouter)
router.use("/verify", verifyRouter)
router.use("/token", tokenRouter)

export default router