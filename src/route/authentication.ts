import { Router } from "express";
import { WorkerRegister, displayFile, AdminRegister, AdminLogin, EmployerRegister, EmployerLogin, WorkerLogin } from "../controller/authentication";
import rateLimit from "express-rate-limit";
import { uploadResume } from "../file/upload";

const router = Router()

// // Display the total workers:
// router.get("/local", TotalWorkers)
router.get("/display", displayFile)



// Register the Admin:
router.post("/admin/register",
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many failed attempts, please try again after 1 minute.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10 + 4,
    message: "Too many failed attempts, please try again after 3 minutes.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10 + 4 + 2,
    message: "Too many failed attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1,
    message: "Too many failed attempts, please try again after 1 hr.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1 + 1,
    message: "Too many failed attempts, please try again after 24 hrs.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Too many accounts were created, please try again after 1 hr.",
    skipFailedRequests: true
  }),

AdminRegister)






// Upload Resume:
router.post("/worker/resume", uploadResume)




// Register User:
router.post("/employer/register",
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many failed attempts, please try again after 1 minute.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10 + 4,
    message: "Too many failed attempts, please try again after 3 minutes.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10 + 4 + 2,
    message: "Too many failed attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1,
    message: "Too many failed attempts, please try again after 1 hr.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1 + 1,
    message: "Too many failed attempts, please try again after 24 hrs.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Too many accounts were created, please try again after 1 hr.",
    skipFailedRequests: true
  }),

EmployerRegister)



// Register User:
router.post("/worker/register",
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many failed attempts, please try again after 1 minute.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10 + 4,
    message: "Too many failed attempts, please try again after 3 minutes.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10 + 4 + 2,
    message: "Too many failed attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1,
    message: "Too many failed attempts, please try again after 1 hr.",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1 + 1,
    message: "Too many failed attempts, please try again after 24 hrs.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Too many accounts were created, please try again after 1 hr.",
    skipFailedRequests: true
  }),

WorkerRegister)











// Login User:
router.post(
  "/admin/login",

  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many failed attempts, please try again after 1 minute.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10 + 4,
    message: "Too many failed attempts, please try again after 3 minutes.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10 + 4 + 2,
    message: "Too many failed attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1,
    message: "Too many failed attempts, please try again after 1 hr.",
    skipSuccessfulRequests: true
  }),
  
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1 + 1,
    message: "Too many failed attempts, please try again after 24 hrs.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Too many login attempts, please try again after 1 hr.",
    skipFailedRequests: true
  }),

  AdminLogin
)



// Login Employer:
router.post(
  "/employer/login",

  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many failed attempts, please try again after 1 minute.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10 + 4,
    message: "Too many failed attempts, please try again after 3 minutes.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10 + 4 + 2,
    message: "Too many failed attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1,
    message: "Too many failed attempts, please try again after 1 hr.",
    skipSuccessfulRequests: true
  }),
  
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1 + 1,
    message: "Too many failed attempts, please try again after 24 hrs.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Too many login attempts, please try again after 1 hr.",
    skipFailedRequests: true
  }),

  EmployerLogin
)



// Login User:
router.post(
  "/worker/login",

  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many failed attempts, please try again after 1 minute.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10 + 4,
    message: "Too many failed attempts, please try again after 3 minutes.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10 + 4 + 2,
    message: "Too many failed attempts, please try again after 15 minutes.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1,
    message: "Too many failed attempts, please try again after 1 hr.",
    skipSuccessfulRequests: true
  }),
  
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 10 + 4 + 2 + 1 + 1,
    message: "Too many failed attempts, please try again after 24 hrs.",
    skipSuccessfulRequests: true
  }),

  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Too many login attempts, please try again after 1 hr.",
    skipFailedRequests: true
  }),

  WorkerLogin
)

export default router