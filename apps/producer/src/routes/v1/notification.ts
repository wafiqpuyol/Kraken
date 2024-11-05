import express, { Router } from "express"
import { notificationController } from "../../controller/notification"

const notificationRouter: Router = express.Router()
notificationRouter.post('/', notificationController)

export { notificationRouter }