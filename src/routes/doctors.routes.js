import { Router } from "express";
import { openSchedules } from "../controllers/doctor.controllers.js";
import { roleProtect } from "../middleware/roleProtectMiddleware.js";

const router = Router();

router.post("/open-schedules", roleProtect([1, 2]), openSchedules);

export default router;
