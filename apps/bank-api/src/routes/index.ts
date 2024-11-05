import express, { Router } from "express"
import V1Routes from "./v1"

const router: Router = express.Router()
router.use('/v1', V1Routes)

export default router