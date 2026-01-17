import { TotalWorkers, VerifiedWorkers } from "../controller/admin";
import { Router } from "express";
import authorized from "../middleware/authorized";
import admin from "../middleware/admin";

const router = Router()

// GET Routes:
router.get("/workers", authorized, admin, TotalWorkers)
router.get("/verified", authorized, admin, VerifiedWorkers)

export default router