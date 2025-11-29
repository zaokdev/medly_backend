import { Router } from "express";
import { roleProtect } from "../middleware/roleProtectMiddleware.js";
import {
  bookAppointment,
  cancelAppointment,
  getUserPatientAppointments,
} from "../controllers/appointments.controllers.js";

const router = Router();

router.post("/book-appointment", roleProtect([3]), bookAppointment);
router.delete("/cancel-appointment", cancelAppointment);
router.get(
  "/get-appointments",
  roleProtect([1, 3]),
  getUserPatientAppointments
);

export default router;
