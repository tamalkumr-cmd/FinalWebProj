import express from "express";
import { register, verifyOtp, login, googleLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyOtp);
router.post("/login", login);
router.post("/google", googleLogin); // ✅ IMPORTANT: only "/google"

export default router;