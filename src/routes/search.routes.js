import { Router } from "express";
import {
  getAllDoctors,
  getAllPatients,
  getRecord,
  getSchedules,
} from "../controllers/search.controllers.js";
import { roleProtect } from "../middleware/roleProtectMiddleware.js";

const router = Router();

router.get("/all-doctors", getAllDoctors);
router.get("/schedule", getSchedules);
router.get("/doctors/get-patients", roleProtect([1, 2]), getAllPatients);
router.get("/doctors/get-record", roleProtect([1, 2]), getRecord);

export default router;
