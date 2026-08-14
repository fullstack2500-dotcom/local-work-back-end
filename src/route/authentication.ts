import { Router } from "express";
import { WorkerRegister, displayFile, AdminRegister, AdminLogin, EmployerRegister, EmployerLogin, WorkerLogin, FindJobs, ViewSkills, DropdownComp, Workers, Reviews, HandleOTPVerification } from "../controller/authentication";
import rateLimit from "express-rate-limit";
import { uploadEmployerPermit, uploadFiles } from "../file/upload";
import { createCompany } from "../controller/authentication";

const router = Router()

// // Display the total workers:
router.get("/display", displayFile)
router.get("/jobs", FindJobs)
router.get("/workers", Workers)
router.get("/rating", Reviews)

router.get("/otp/:email", HandleOTPVerification)

router.post("/companies", createCompany);

// DropDown:
router.get("/ViewSkills", ViewSkills)
router.get("/dropdown", DropdownComp)


// Register the Admin:
router.post("/admin/register",
  rateLimit({ windowMs: 1 * 60 * 1000, max: 10, message: "Too many failed attempts, please try again after 1 minute.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 3 * 60 * 1000, max: 10 + 4, message: "Too many failed attempts, please try again after 3 minutes.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 + 4 + 2, message: "Too many failed attempts, please try again after 15 minutes.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 + 4 + 2 + 1, message: "Too many failed attempts, please try again after 1 hr.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 10 + 4 + 2 + 1 + 1, message: "Too many failed attempts, please try again after 24 hrs.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: "Too many accounts were created, please try again after 1 hr.", skipFailedRequests: true }),

AdminRegister)



// Register User:
router.post("/employer/register",
  rateLimit({ windowMs: 1 * 60 * 1000, max: 10, message: "Too many failed attempts, please try again after 1 minute.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 3 * 60 * 1000, max: 10 + 4, message: "Too many failed attempts, please try again after 3 minutes.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 + 4 + 2, message: "Too many failed attempts, please try again after 15 minutes.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 + 4 + 2 + 1, message: "Too many failed attempts, please try again after 1 hr.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 10 + 4 + 2 + 1 + 1, message: "Too many failed attempts, please try again after 24 hrs.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: "Too many accounts were created, please try again after 1 hr.", skipFailedRequests: true }),

  uploadEmployerPermit.single("permit"),
  
EmployerRegister)



// Register User:
router.post("/worker/register",
  rateLimit({ windowMs: 1 * 60 * 1000, max: 10, message: "Too many failed attempts, please try again after 1 minute.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 3 * 60 * 1000, max: 10 + 4, message: "Too many failed attempts, please try again after 3 minutes.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 + 4 + 2, message: "Too many failed attempts, please try again after 15 minutes.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 + 4 + 2 + 1, message: "Too many failed attempts, please try again after 1 hr.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 10 + 4 + 2 + 1 + 1, message: "Too many failed attempts, please try again after 24 hrs.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: "Too many accounts were created, please try again after 1 hr.", skipFailedRequests: true }),
  
  uploadFiles.fields([
    { name: "resume", maxCount: 1 }, // Required
    { name: "photo", maxCount: 1 },  // Optional
  ]),

WorkerRegister)


// // Ensure the field name matches the frontend form input
// router.post("/worker/register", uploadResume.single("resume"), WorkerRegister);


// Login User:
router.post("/admin/login",
  rateLimit({ windowMs: 1 * 60 * 1000, max: 10, message: "Too many failed attempts, please try again after 1 minute.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 3 * 60 * 1000, max: 10 + 4, message: "Too many failed attempts, please try again after 3 minutes.", skipSuccessfulRequests: true }),

  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 + 4 + 2, message: "Too many failed attempts, please try again after 15 minutes.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 + 4 + 2 + 1, message: "Too many failed attempts, please try again after 1 hr.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 10 + 4 + 2 + 1 + 1, message: "Too many failed attempts, please try again after 24 hrs.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: "Too many login attempts, please try again after 1 hr.", skipFailedRequests: true }),

  AdminLogin
)



// Login Employer:
router.post("/employer/login",
  rateLimit({ windowMs: 1 * 60 * 1000, max: 10, message: "Too many failed attempts, please try again after 1 minute.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 3 * 60 * 1000, max: 10 + 4, message: "Too many failed attempts, please try again after 3 minutes.", skipSuccessfulRequests: true }),

  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 + 4 + 2, message: "Too many failed attempts, please try again after 15 minutes.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 + 4 + 2 + 1, message: "Too many failed attempts, please try again after 1 hr.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 10 + 4 + 2 + 1 + 1, message: "Too many failed attempts, please try again after 24 hrs.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: "Too many login attempts, please try again after 1 hr.", skipFailedRequests: true }),

  EmployerLogin
)



// Login User:
router.post("/worker/login",
  rateLimit({ windowMs: 1 * 60 * 1000, max: 10, message: "Too many failed attempts, please try again after 1 minute.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 3 * 60 * 1000, max: 10 + 4, message: "Too many failed attempts, please try again after 3 minutes.", skipSuccessfulRequests: true }),

  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 + 4 + 2, message: "Too many failed attempts, please try again after 15 minutes.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 + 4 + 2 + 1, message: "Too many failed attempts, please try again after 1 hr.", skipSuccessfulRequests: true }),
  
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 10 + 4 + 2 + 1 + 1, message: "Too many failed attempts, please try again after 24 hrs.", skipSuccessfulRequests: true }),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: "Too many login attempts, please try again after 1 hr.", skipFailedRequests: true }),

  WorkerLogin
)

export default router