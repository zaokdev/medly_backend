import { Router } from "express";
import {
  getUserDoctorAppointments,
  openSchedules,
} from "../controllers/doctor.controllers.js";
import { roleProtect } from "../middleware/roleProtectMiddleware.js";

const router = Router();

router.post("/open-schedules", roleProtect([2]), openSchedules);
router.get("/get-appointments", roleProtect([1, 2]), getUserDoctorAppointments);

export default router;
