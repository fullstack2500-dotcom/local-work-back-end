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
    message: "Too many failed attempts, please try again after 1 minute",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 10 + 4,
    message: "Too many failed attempts, please try again after 2 minutes",
    skipSuccessfulRequests: true
  }),
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10 + 4 + 1,
    message: "Too many failed attempts, please try again after 5 minutes",
    skipSuccessfulRequests: true
  }),
Register)
router.post("/login", Login)

export default router