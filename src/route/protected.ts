import { Router } from "express";
import { CreateJob, Dashboard, IsUserLogged, LogOut } from "../controller/protected";
import authorized from "../middleware/authorized";
import { employers } from "../middleware/roles";

const router = Router()

// GET Requests:
router.get("/dashboard", authorized, Dashboard)
router.get("/isUserLogged", authorized, IsUserLogged)

// POST Requests:
router.post("/createJob", authorized, employers, CreateJob)
router.post("/logout", authorized, LogOut)

export default router