import express from "express";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import jwt from "jsonwebtoken";
import {
    getProfile,
    updateProfile,
    searchPersonnel
} from "../controllers/user.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

// 📥 MULTER CONFIG (Memory Storage for Cloudinary pass-through)
const upload = multer({ storage: multer.memoryStorage() });

// ☁️ CLOUDINARY CONFIG
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🛡️ AUTH_PROTECTION_MIDDLEWARE
const protect = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "MISSION_FAILURE: No_Auth_Header" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ message: "AUTH_ERR: Personnel_Not_Found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("AUTH_GATE_CRASH:", err.message);
        res.status(401).json({ message: "AUTH_ERR: Token_Invalid_Or_Expired" });
    }
};

// ==========================================
// 📡 PERSONNEL DATA ROUTES
// ==========================================

// 👤 GET_CURRENT_USER [GET /api/users/me]
router.get("/me", protect, getProfile);

// 🔍 SEARCH_PERSONNEL [GET /api/users/search]
router.get("/search", protect, searchPersonnel);

// 📝 UPDATE_PROFILE_DATA [PUT /api/users/profile]
router.put("/profile", protect, updateProfile);

// 📸 PHOTO_UPLOAD [POST /api/users/profile/photo]
// Keeping this logic here for direct Cloudinary stream management
router.post("/profile/photo", protect, upload.single("photo"), async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "NO_FILE_DETECTED" });

        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(fileBase64, {
            folder: "sky_link_avatars",
            public_id: `user_${req.user.id}`,
            overwrite: true
        });

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { photoUrl: uploadResult.secure_url },
            select: { photoUrl: true }
        });

        res.json({ url: updatedUser.photoUrl });
    } catch (err) {
        console.error("CLOUDINARY_UPLOAD_ERR:", err);
        res.status(500).json({ message: "UPLOAD_REJECTED" });
    }
});

export default router;