import { Router } from "express";
import { Dashboard, IsUserLogged, createJob, LogOut, createApplication, viewPostedJobs, viewJobOverview, viewJobApplications } from "../controller/protected";
import authorized from "../middleware/authorized";
import { employers, worker } from "../middleware/roles";

const router = Router()

// GET Requests [Global]:
router.get("/dashboard", authorized, Dashboard)
router.get("/isUserLogged", authorized, IsUserLogged)

// GET Requests [Workers]:
router.get("/applications", authorized, worker, viewJobApplications)

// GET Requests [Employers]:
router.get("/viewPostedJobs", authorized, employers, viewPostedJobs)
router.get("/viewJobOverview/:job", authorized, employers, viewJobOverview)

// POST Requests [Workers]:
router.post("/createApp", authorized, worker, createApplication)

// POST Requests [Employers]:
router.post("/createJob", authorized, employers, createJob)

// LogOut Controller:
router.post("/logout", authorized, LogOut)

export default router