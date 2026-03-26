import express from "express";
import { register, verifyOtp, login, googleLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
// 🛰️ CHANGED: From "/verify" to "/verify-otp" to match Frontend
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/google", googleLogin);

export default router;