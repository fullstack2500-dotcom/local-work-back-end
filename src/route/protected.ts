import { Router } from "express";
import { Dashboard, IsUserLogged, createJob, LogOut, createApplication, viewPostedJobs, viewJobOverview, viewJobApplications, addCompany, AddLocation, AddSkill, viewJobs } from "../controller/protected";
import authorized from "../middleware/authorized";
import { employers, worker } from "../middleware/roles";

const router = Router()

// GET Requests [Global]:
router.get("/dashboard", authorized, Dashboard)
router.get("/isUserLogged", authorized, IsUserLogged)

// GET Requests [Workers]:
router.get("/applications", authorized, worker, viewJobApplications)
router.get("/viewJobs", authorized, worker, viewJobs)

// GET Requests [Employers]:
router.get("/viewPostedJobs", authorized, employers, viewPostedJobs)
router.get("/viewJobOverview", authorized, employers, viewJobOverview)

// POST Requests [Workers]:
router.post("/createApp", authorized, worker, createApplication)

// POST Requests [Employers]:
router.post("/createJob", authorized, employers, createJob)
router.post("/addCompany", authorized, employers, addCompany)
router.post("/addLocation", authorized, employers, AddLocation)
router.post("/addSkill", authorized, employers, AddSkill)

// LogOut Controller:
router.post("/logout", authorized, LogOut)

export default router