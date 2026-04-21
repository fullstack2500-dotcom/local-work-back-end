import { TotalWorkers, PendingWorkers, VerifiedWorkers, DeclinedWorkers, NewSkillController, Applications, UpdateJobStatus, WorkersEmployers, Dashboard, ViewJobsNew, AddNewIndustry, Profiles, UpdateWorkersEmployersInformation, DeleteWorkerEmployer, Reports } from "../controller/admin";
import { Router } from "express";
import authorized from "../middleware/authorized";
import { admin } from "../middleware/roles";

const router = Router()

// GET Routes:
router.get("/dashboard", authorized, admin, Dashboard)
router.get("/profiles/:role", authorized, admin, Profiles)
router.get("/workers", authorized, admin, TotalWorkers)
router.get("/workers/pending", authorized, admin, PendingWorkers)
router.get("/workers/accepted", authorized, admin, VerifiedWorkers)
router.get("/workers/declined", authorized, admin, DeclinedWorkers)
router.get("/applications", authorized, admin, Applications)
router.get("/jobs", authorized, admin, ViewJobsNew)
router.get("/worker/employer", authorized, admin, WorkersEmployers)
router.get("/reports", authorized, admin, Reports)

// POST Routes:
router.post("/skill", authorized, admin, NewSkillController)
router.post("/industry", authorized, admin, AddNewIndustry)

// PATCH Routes:
router.put("/updateJob/:job", authorized, admin, UpdateJobStatus)
router.put("/updateStatus", authorized, admin, UpdateWorkersEmployersInformation)
router.put("/deleteUser", authorized, admin, DeleteWorkerEmployer)

export default router