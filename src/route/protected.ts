import { Router } from "express";
import { Dashboard, IsUserLogged, LogOut, viewPostedJobs, viewJobOverview, addCompany, AddLocation, AddTag, createJob, viewJobs, newApplication } from "../controller/protected";
import authorized from "../middleware/authorized";
import { employers, worker } from "../middleware/roles";

const router = Router()

// GET Requests [Global]:
router.get("/dashboard", authorized, Dashboard)
router.get("/isUserLogged", authorized, IsUserLogged)

// GET Requests [Workers]:
router.get("/viewJobs", authorized, worker, viewJobs)
// router.get("/viewProfile", authorized, worker, viewProfile)

// GET Requests [Employers]:
router.get("/viewPostedJobs", authorized, employers, viewPostedJobs)
router.get("/viewJobOverview", authorized, employers, viewJobOverview)

// // POST Requests [Workers]:
router.post("/application", authorized, worker, newApplication)

// // POST Requests [Employers]:
router.post("/createJob", authorized, employers, createJob)
router.post("/addCompany", authorized, employers, addCompany)
router.post("/addLocation", authorized, employers, AddLocation)
router.post("/addTag", authorized, employers, AddTag)

// LogOut Controller:
router.post("/logout", authorized, LogOut)

export default router