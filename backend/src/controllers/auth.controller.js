import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendMail } from "../utils/mailer.js";
import admin from "../config/firebaseAdmin.js";

// =======================
// REGISTER
// =======================
export async function register(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Email and password required" });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ error: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        const code = String(generateOtp());

        // Delete old OTPs for this email
        await prisma.otp.deleteMany({ where: { email } });

        // Store OTP + hashed password TEMPORARILY
        await prisma.otp.create({
            data: {
                email,
                code,
                password: hash,
                expiresAt: new Date(Date.now() + 1 * 60 * 1000), // 1 minute
            },
        });

        await sendMail(
            email,
            "Your OTP",
            `<h1>Your OTP is: ${code}</h1><p>Valid for 1 minute.</p>`
        );

        res.json({ message: "OTP sent to email" });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ error: "Register failed" });
    }
}

// =======================
// VERIFY OTP
// =======================
export async function verifyOtp(req, res) {
    try {
        const { email, code } = req.body;

        if (!email || !code)
            return res.status(400).json({ error: "Email and code required" });

        const otp = await prisma.otp.findFirst({
            where: { email },
            orderBy: { expiresAt: "desc" },
        });

        if (!otp) return res.status(400).json({ error: "Invalid OTP" });

        if (otp.expiresAt < new Date()) {
            await prisma.otp.deleteMany({ where: { email } });
            return res.status(400).json({ error: "OTP expired. Register again." });
        }

        if (String(code).trim() !== String(otp.code).trim())
            return res.status(400).json({ error: "Invalid OTP" });

        // Create user
        await prisma.user.create({
            data: {
                email,
                password: otp.password,
                isVerified: true,
            },
        });

        // Cleanup OTP
        await prisma.otp.deleteMany({ where: { email } });

        res.json({ message: "Account created successfully" });
    } catch (err) {
        console.error("VERIFY ERROR:", err);
        res.status(500).json({ error: "OTP verification failed" });
    }
}

// =======================
// LOGIN (Email + Password)
// =======================
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Email and password required" });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "User not found" });

        if (!user.isVerified)
            return res.status(400).json({ error: "Email not verified" });

        if (!user.password)
            return res.status(400).json({ error: "Use Google login for this account" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ error: "Wrong password" });

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not set");
        }

        const token = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Login failed" });
    }
}

// =======================
// GOOGLE LOGIN
// =======================
export async function googleLogin(req, res) {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Token required" });

        const decoded = await admin.auth().verifyIdToken(token);

        const { uid, email, picture, name } = decoded;

        if (!email) {
            return res.status(400).json({ error: "Google account has no email" });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split("@")[0], // ✅ THIS MUST BE HERE
                    password: null,
                    isVerified: true,
                    googleId: uid,
                    avatar: picture || null,
                },
            });
        }

        const appToken = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.json({ token: appToken });
    } catch (err) {
        console.error("GOOGLE LOGIN ERROR:", err);
        res.status(401).json({ error: "Invalid Google token" });
    }
}