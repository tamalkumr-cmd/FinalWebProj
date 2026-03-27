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
        const { email: rawEmail, password } = req.body;
        const email = rawEmail.toLowerCase().trim(); // Case-insensitive fix

        if (!email || !password)
            return res.status(400).json({ error: "Email and password required" });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ error: "Personnel record already exists." });

        const hash = await bcrypt.hash(password, 10);
        const code = String(generateOtp());

        await prisma.otp.deleteMany({ where: { email } });

        await prisma.otp.create({
            data: {
                email,
                code,
                password: hash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        await sendMail(
            email,
            "Sky_Link.os // Verification Code",
            `<h1>Authentication Required</h1>
             <p>Your unique access code is: <strong>${code}</strong></p>`
        );

        console.log(`📡 [OTP_SENT]: Transmitted to ${email}`);
        res.json({ message: "OTP transmitted to email." });
    } catch (err) {
        console.error("❌ [REGISTER_ERROR]:", err);
        res.status(500).json({ error: "Failed to initiate registration." });
    }
}

// ==========================================
// 🔑 VERIFY OTP
// ==========================================
export async function verifyOtp(req, res) {
    try {
        const { email: rawEmail, code } = req.body;
        const email = rawEmail.toLowerCase().trim();

        const otp = await prisma.otp.findFirst({
            where: { email },
            orderBy: { createdAt: "desc" },
        });

        if (!otp || new Date() > new Date(otp.expiresAt)) {
            return res.status(400).json({ error: "Code expired or not found." });
        }

        if (String(code).trim() !== String(otp.code).trim())
            return res.status(400).json({ error: "Invalid verification code." });

        const user = await prisma.user.create({
            data: {
                email,
                password: otp.password,
                isVerified: true,
                name: email.split("@")[0],
                designation: "FLIGHT_OFFICER",
            },
        });

        await prisma.otp.deleteMany({ where: { email } });

        const token = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET || "SKY_LINK_SECURE_KEY", { expiresIn: "7d" }
        );

        res.json({ message: "Signal Verified.", token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error("❌ [VERIFY_ERROR]:", err);
        res.status(500).json({ error: "Verification failed." });
    }
}

// ==========================================
// 🔐 LOGIN (SECURE CHANNEL)
// ==========================================
export async function login(req, res) {
    try {
        const { email: rawEmail, password } = req.body;
        if (!rawEmail || !password) return res.status(400).json({ error: "Credentials missing." });

        const email = rawEmail.toLowerCase().trim();
        console.log(`📡 [LOGIN_ATTEMPT]: ${email}`);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.warn(`⚠️ [AUTH_FAILED]: ${email} not found.`);
            return res.status(400).json({ error: "Personnel not found." });
        }

        const ok = await bcrypt.compare(password, user.password);

        if (!ok) {
            console.error(`❌ [PASSWORD_MISMATCH]: Failed key for ${email}`);
            return res.status(400).json({ error: "Access Denied: Invalid Password." });
        }

        const token = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET || "SKY_LINK_SECURE_KEY", { expiresIn: "7d" }
        );

        console.log(`🟢 [LOGIN_SUCCESS]: ${user.name} online.`);
        res.json({ token, user: { id: user.id, name: user.name } });
    } catch (err) {
        console.error("❌ [AUTH_CRITICAL_FAILURE]:", err.message);
        res.status(500).json({ error: "Authentication failed." });
    }
}