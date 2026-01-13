import { Router } from "express";
import { Dashboard } from "../controller/protected";
import authorized from "../middleware/authorized";

const router = Router()

// GET Requests:
router.get("/dashboard", authorized, Dashboard)

export default router