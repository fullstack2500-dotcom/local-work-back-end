import { Router } from "express";
import { Dashboard, IsUserLogged, LogOut, viewPostedJobs, viewJobOverview, addCompany, AddLocation, AddTag, createJob, viewJobs, newApplication, viewApplications, WithdrawApplication, viewApplicationsEmployer, UpdateApp, UpdateInterview, CompanyDetails, ViewWorkers, IsApplied, Locations } from "../controller/protected";
import authorized from "../middleware/authorized";
import { employers, worker } from "../middleware/roles";

const router = Router()

// GET Requests [Global]:
router.get("/dashboard", authorized, Dashboard)
router.get("/isUserLoggedWorker", authorized, worker, IsUserLogged)
router.get("/isUserLoggedEmployer", authorized, employers, IsUserLogged)

// GET Requests [Workers]:
router.get("/viewJobs", authorized, worker, viewJobs)
router.get("/isApplied/:job", authorized, worker, IsApplied)

// GET Requests [Employers]:
router.get("/viewPostedJobs", authorized, employers, viewPostedJobs)
router.get("/viewJobOverview", authorized, employers, viewJobOverview)
router.get("/viewApplications", authorized, worker, viewApplications)
router.get("/viewApplications/employer", authorized, employers, viewApplicationsEmployer)
router.get("/company", authorized, employers, CompanyDetails)
router.get("/viewWorkers", authorized, employers, ViewWorkers)
router.get("/Locations", authorized, employers, Locations)

// // POST Requests [Workers]:
router.post("/createApplication", authorized, worker, newApplication)

// // POST Requests [Employers]:
router.post("/createJob", authorized, employers, createJob)
router.post("/addCompany", authorized, employers, addCompany)
router.post("/addLocation", authorized, employers, AddLocation)
router.post("/addTag", authorized, employers, AddTag)

// PUT [Workers]:
router.put("/withdrawApplication", authorized, worker, WithdrawApplication)

// PUT [Employers]:
router.put("/date", authorized, employers, UpdateInterview)
router.put("/update/application", authorized, employers, UpdateApp)

// LogOut Controller:
router.post("/logout", authorized, LogOut)

export default router