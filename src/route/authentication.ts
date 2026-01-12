import { Router } from "express";
import { Register, Login } from "../controller/authentication";

const router = Router()

// Register and Login the User:
router.post("/register", Register)
router.post("/login", Login)

export default router