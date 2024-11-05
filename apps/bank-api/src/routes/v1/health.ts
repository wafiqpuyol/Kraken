import express, { Router } from "express"
import { healthController } from "../../controller/health"

const healthRouter: Router = express.Router()

healthRouter.get("/", healthController)

export { healthRouter }