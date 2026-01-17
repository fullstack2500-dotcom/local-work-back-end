import { Router } from "express";
import { Register, Login, TotalWorkers } from "../controller/authentication";

const router = Router()

// Display the total workers:
router.get("/local", TotalWorkers)

// Register and Login the User:
router.post("/register", Register)
router.post("/login", Login)

export default router