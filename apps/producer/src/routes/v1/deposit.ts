import express, { Router } from "express"
import { depositController } from "../../controller/deposit"

const depositRouter = express.Router()
depositRouter.post('/', depositController)

export { depositRouter }