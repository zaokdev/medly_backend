import { Router } from "express";
import { roleProtect } from "../middleware/roleProtectMiddleware.js";
import {
  bookAppointment,
  cancelAppointment,
  createDiagnosis,
  getCitaById,
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
router.get("/:id", roleProtect([1, 2]), getCitaById);

router.post("/create-diagnosis", roleProtect([2]), createDiagnosis);

export default router;
