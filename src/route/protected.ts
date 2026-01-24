import { Router } from "express";
import { Dashboard, IsUserLogged, LogOut } from "../controller/protected";
import authorized from "../middleware/authorized";

const router = Router()

// GET Requests:
router.get("/dashboard", authorized, Dashboard)
router.get("/isUserLogged", authorized, IsUserLogged)

// POST Requests:
router.post("/logout", authorized, LogOut)

export default router