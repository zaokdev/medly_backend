import { Router } from "express";
import {
  getAllDoctors,
  getSchedules,
} from "../controllers/search.controllers.js";

const router = Router();

router.get("/all-doctors", getAllDoctors);
router.get("/schedule", getSchedules);

export default router;
