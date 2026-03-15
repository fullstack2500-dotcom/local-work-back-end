import { Router } from "express";
import { Dashboard, IsUserLogged, LogOut, viewPostedJobs, viewJobOverview, addCompany, AddLocation, AddTag, createJob, viewJobs, newApplication, viewApplications, WithdrawApplication, viewApplicationsEmployer, UpdateApp, UpdateInterview, CompanyDetails, ViewWorkers, IsApplied, Locations, ViewProfileController, UpdateWorker, UpdateEmployer, EmployerProfileController, ReviewUpload, PostContact, OpenPositionsTotalApplications } from "../controller/protected";
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
router.get("/worker/profile", authorized, worker, ViewProfileController)

// GET Requests [Employers]:
router.get("/viewPostedJobs", authorized, employers, viewPostedJobs)
router.get("/viewJobOverview", authorized, employers, viewJobOverview)
router.get("/viewApplications", authorized, worker, viewApplications)
router.get("/viewApplications/employer", authorized, employers, viewApplicationsEmployer)
router.get("/company", authorized, employers, CompanyDetails)
router.get("/viewWorkers", authorized, employers, ViewWorkers)
router.get("/Locations", authorized, employers, Locations)
router.get("/employer/information", authorized, employers, EmployerProfileController)
router.get("/openPositions/totalApplications", authorized, employers, OpenPositionsTotalApplications)

// // POST Requests [Workers]:
router.post("/createApplication", authorized, worker, newApplication)
router.post("/rating", authorized, worker, ReviewUpload)

// // POST Requests [Employers]:
router.post("/createJob", authorized, employers, createJob)
router.post("/addCompany", authorized, employers, addCompany)
router.post("/addLocation", authorized, employers, AddLocation)
router.post("/addTag", authorized, employers, AddTag)
router.post("/contact", authorized, employers, PostContact)

// PUT [Workers]:
router.put("/withdrawApplication", authorized, worker, WithdrawApplication)
router.put("/worker/updateProfile", authorized, worker, UpdateWorker)

// PUT [Employers]:
router.put("/date", authorized, employers, UpdateInterview)
router.put("/update/application", authorized, employers, UpdateApp)
router.put("/update/employer", authorized, employers, UpdateEmployer)

// LogOut Controller:
router.post("/logout", authorized, LogOut)

export default router