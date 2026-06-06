import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  signup,
  login,
  me,
  logout,
  resendVerification,
  verifyEmail,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/resend-verification", resendVerification);
router.get("/verify-email/:token", verifyEmail);

export default router;
