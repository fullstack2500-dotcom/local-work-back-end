import { Router } from "express";
import { Register, Login, TotalWorkers } from "../controller/authentication";
import rateLimit from "express-rate-limit";

const router = Router()

// Display the total workers:
router.get("/local", TotalWorkers)

// Register and Login the User:
router.post("/register",
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
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: "Too many accounts were created, please try again after 1 hr.",
    skipFailedRequests: true
  }),

Register)
router.post("/login", Login)

export default router