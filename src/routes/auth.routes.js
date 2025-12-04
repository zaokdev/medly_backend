import { Router } from "express";
import {
  createDoctor,
  createUser,
  loginUser,
  logoutUser,
  verifySession,
} from "../controllers/auth.controllers.js";
import { roleProtect } from "../middleware/roleProtectMiddleware.js";

const router = Router();

router.post("/register", createUser);
router.post("/private/new-doctor", roleProtect([1]), createDoctor);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/verify", verifySession);

export default router;
