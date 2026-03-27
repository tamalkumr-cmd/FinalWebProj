import express from "express";
import { register, verifyOtp, login } from "../controllers/auth.controller.js";

const router = express.Router();

// 🚀 Personnel Registration Handshake
router.post("/register", register);

// 🔑 OTP Verification (Matches Frontend Hook)
router.post("/verify-otp", verifyOtp);

// 🔐 Secure Channel Login
router.post("/login", login);

// 🛸 FIREBASE DECOMMISSIONED: Google route removed to prevent crashes

export default router;