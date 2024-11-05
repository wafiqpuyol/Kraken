import express, { Router } from "express"
import { tokenController } from "../../controller/token"

const tokenRouter: Router = express.Router()

tokenRouter.post("/", tokenController)

export { tokenRouter }