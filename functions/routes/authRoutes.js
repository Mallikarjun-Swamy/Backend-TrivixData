import express from "express";
import {
  registerUser,
  googleAuthRedirect,
  googleAuthCallback,
  verifyEmail,
  logout,
  getMe,
  loginUser,
  refreshAccessToken,
  requestPasswordChange,
  requestEmailChange,
  verifyEmailChange,
  verifyPasswordChange,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /register
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/verify-email", verifyEmail);
router.get("/google", googleAuthRedirect); // GET /auth/google → redirect to Google OAuth
router.get("/google/callback", googleAuthCallback); // GET /auth/google/callback → handle OAuth callback
router.get("/me", authMiddleware, getMe);
router.post("/logout", logout);
router.post("/request-password-change", authMiddleware, requestPasswordChange);
router.post("/request-email-change", authMiddleware, requestEmailChange);
router.post("/verify-email-change", verifyEmailChange);
router.post("/verify-password-change", verifyPasswordChange);

export default router;
