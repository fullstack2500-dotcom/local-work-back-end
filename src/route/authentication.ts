import { Router } from "express";
import { Register } from "../controller/authentication";

const router = Router()

// Register and Login the User:
router.post("/register", Register)

export default router