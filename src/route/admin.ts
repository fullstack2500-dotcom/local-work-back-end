import { PendingJobs, TotalJobs, TotalWorkers, PendingWorkers, VerifiedWorkers, DeclinedWorkers, NewSkillController, Applications, ViewJobs, UpdateJobStatus, WorkersEmployers } from "../controller/admin";
import { Router } from "express";
import authorized from "../middleware/authorized";
import { admin } from "../middleware/roles";

const router = Router()

// GET Routes:
router.get("/totalJobs", authorized, admin, TotalJobs)
router.get("/pendingJobs", authorized, admin, PendingJobs)
router.get("/workers", authorized, admin, TotalWorkers)
router.get("/workers/pending", authorized, admin, PendingWorkers)
router.get("/workers/accepted", authorized, admin, VerifiedWorkers)
router.get("/workers/declined", authorized, admin, DeclinedWorkers)
router.get("/applications", authorized, admin, Applications)
router.get("/jobs", authorized, admin, ViewJobs)
router.get("/worker/employer", authorized, admin, WorkersEmployers)

// POST Routes:
router.post("/skill", authorized, admin, NewSkillController)

// PATCH Routes:
router.put("/updateJob/:job", authorized, admin, UpdateJobStatus)

export default router