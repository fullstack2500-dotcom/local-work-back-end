import { Router } from "express";
import { Dashboard, UploadWorkerProfilePhoto, IsUserLogged, LogOut, viewPostedJobs, getCityProvinceList, viewJobOverview, AddLocation, AddTag, createJob, viewJobs, newApplication, viewApplications, WithdrawApplication, viewApplicationsEmployer, UpdateApp, UpdateInterview, CompanyDetails, ViewWorkers, IsApplied, Locations, ViewProfileController, UpdateWorker, UpdateEmployer, EmployerProfileController, ReviewUpload, PostContact, OpenPositionsTotalApplications, GetIndustries, UploadEmployerProfilePhoto, ViewContacts, ViewMessage, NewMessage, ViewContactsEmployer, UserNotifications, MarkAsRead, DeleteNotification } from "../controller/protected";
import authorized from "../middleware/authorized";
import { employers, worker, admin } from "../middleware/roles";
import { uploadProfilePhoto } from "../file/upload";

const router = Router()

// GET Requests [Global]:
router.get("/dashboard", authorized, Dashboard)
router.get("/isWorkerLogged", authorized, worker, IsUserLogged)
router.get("/isEmployerLogged", authorized, employers, IsUserLogged)
router.get("/isAdminLogged", authorized, admin, IsUserLogged)
router.get("/Location", authorized, employers, getCityProvinceList);
router.get("/notifications", authorized, UserNotifications)
router.get("/message/:_id", authorized, ViewMessage)

// PATCH [Global]:
router.patch("/markAsRead/:_id", authorized, MarkAsRead)

// DELETE [Global]:
router.delete("/deleteNotif/:_id", authorized, DeleteNotification)

// POST Request [Worker & Employer]:
router.post("/message/:contact", authorized, NewMessage)


// GET Requests [Workers]:
router.get("/viewJobs", authorized, worker, viewJobs)
router.get("/isApplied/:job", authorized, worker, IsApplied)
router.get("/worker/profile", authorized, worker, ViewProfileController)
router.get("/contacts", authorized, worker, ViewContacts)


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

router.get("/Industries", authorized, employers, GetIndustries)
router.get("/employer/contacts", authorized, employers, ViewContactsEmployer)


// // POST Requests [Workers]:
router.post("/createApplication", authorized, worker, newApplication)
router.post("/rating", authorized, worker, ReviewUpload)

// // POST Requests [Employers]:
router.post("/createJob", authorized, employers, createJob)
router.post("/addLocation", authorized, employers, AddLocation)

router.post("/addTag", authorized, employers, AddTag)
router.post("/contact", authorized, employers, PostContact)


// PUT [Workers]:
router.put("/withdrawApplication", authorized, worker, WithdrawApplication)
router.put(
  "/worker/updateProfile",
  authorized,
  worker,
  UpdateWorker
);
router.put(
  "/worker/upload-photo",
  authorized,
  worker,
  uploadProfilePhoto.single("photo"),
  UploadWorkerProfilePhoto
);
router.put(
  "/employer/upload-photo",
  authorized,
  employers,
  uploadProfilePhoto.single("photo"),
  UploadEmployerProfilePhoto
);

// PUT [Employers]:
router.put("/date", authorized, employers, UpdateInterview)
router.put("/update/application", authorized, employers, UpdateApp)
router.put("/update/employer", authorized, employers, UpdateEmployer)


// LogOut Controller:
router.post("/logout", authorized, LogOut)

export default router