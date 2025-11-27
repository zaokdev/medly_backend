import { Router } from "express";
import { getAllDoctors } from "../controllers/search.controllers.js";

const router = Router();

router.get("/all-doctors", getAllDoctors);

export default router;
