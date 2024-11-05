import express, { Router } from "express"
import { verifyController } from "../../controller/verify"

const verifyRouter: Router = express.Router()

verifyRouter.post("/", verifyController)

export { verifyRouter }