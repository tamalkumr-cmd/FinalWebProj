import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendMail } from "../utils/mailer.js";

// ==========================================
// 🚀 REGISTER (INITIATE HANDSHAKE)
// ==========================================
export async function register(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Email and password required" });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ error: "Personnel record already exists for this email." });

        const hash = await bcrypt.hash(password, 10);
        const code = String(generateOtp());

        // Cleanup old attempts
        await prisma.otp.deleteMany({ where: { email } });

        // Store OTP + Hash with a 5-minute window
        await prisma.otp.create({
            data: {
                email,
                code,
                password: hash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 MINUTES
            },
        });

        await sendMail(
            email,
            "Sky_Link.os // Verification Code",
            `<h1>Authentication Required</h1>
             <p>Your unique access code is: <strong>${code}</strong></p>
             <p>This frequency is active for 5 minutes.</p>`
        );

        res.json({ message: "OTP transmitted to email." });
    } catch (err) {
        console.error("REGISTER_ERROR:", err);
        res.status(500).json({ error: "Failed to initiate registration." });
    }
}

// ==========================================
// 🔑 VERIFY OTP (SYNC & AUTO-LOGIN)
// ==========================================
export async function verifyOtp(req, res) {
    try {
        const { email, code } = req.body;

        if (!email || !code)
            return res.status(400).json({ error: "Email and code required" });

        const otp = await prisma.otp.findFirst({
            where: { email },
            orderBy: { createdAt: "desc" },
        });

        if (!otp) return res.status(400).json({ error: "No active verification found." });

        // 🕒 Check Expiration
        if (new Date() > new Date(otp.expiresAt)) {
            await prisma.otp.deleteMany({ where: { email } });
            return res.status(400).json({ error: "TRANSMISSION_TIMEOUT: Code expired." });
        }

        // 🛡️ Verify Match
        if (String(code).trim() !== String(otp.code).trim())
            return res.status(400).json({ error: "Invalid verification code." });

        // 👤 Create Personnel Profile
        const user = await prisma.user.create({
            data: {
                email,
                password: otp.password,
                isVerified: true,
                name: email.split("@")[0],
                designation: "FLIGHT_OFFICER",
            },
        });

        // Cleanup
        await prisma.otp.deleteMany({ where: { email } });

        // 🎟️ GENERATE PASSPORT (JWT)
        const token = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.json({
            message: "Signal Verified. Welcome to Sky_Link.",
            token,
            user: { id: user.id, email: user.email }
        });

    } catch (err) {
        console.error("VERIFY_ERROR:", err);
        if (err.code === 'P2002') return res.status(400).json({ error: "User already registered." });
        res.status(500).json({ error: "Verification process failed." });
    }
}

// ==========================================
// 🔐 LOGIN (SECURE CHANNEL)
// ==========================================
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Email and password required" });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "Personnel not found." });

        if (!user.isVerified)
            return res.status(400).json({ error: "Account verification pending." });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ error: "Access Denied: Invalid Password." });

        const token = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.json({ token, user: { id: user.id, name: user.name } });
    } catch (err) {
        console.error("LOGIN_ERROR:", err);
        res.status(500).json({ error: "Authentication failed." });
    }
}