import express from "express";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// 📥 MULTER CONFIG
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

        // 🛠️ REWRITTEN TO AVOID OPTIONAL CHAINING FORMATTING ISSUES
        if (!authHeader) {
            return res.status(401).json({ message: "MISSION_FAILURE: No_Auth_Header" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "MISSION_FAILURE: No_Token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ message: "AUTH_ERR: User_Not_Found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("AUTH_GATE_CRASH:", err.message);
        res.status(401).json({ message: "AUTH_ERR: Token_Invalid_Or_Expired" });
    }
};

// 👤 GET_CURRENT_USER [GET /api/users/me]
router.get("/me", protect, async(req, res) => {
    const { password, ...userData } = req.user;
    res.json(userData);
});

// 📸 PHOTO_UPLOAD [POST /api/users/profile/photo]
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
            data: { photoUrl: uploadResult.secure_url }
        });

        res.json({ url: updatedUser.photoUrl });
    } catch (err) {
        console.error("CLOUDINARY_UPLOAD_ERR:", err);
        res.status(500).json({ message: "UPLOAD_REJECTED" });
    }
});

// 📝 UPDATE_PROFILE_DATA [PUT /api/users/profile]
router.put("/profile", protect, async(req, res) => {
    try {
        const { name, empId, bio, designation } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: name || req.user.name,
                empId: empId || req.user.empId,
                bio: bio || req.user.bio,
                designation: designation || req.user.designation
            }
        });

        const { password, ...finalData } = updatedUser;
        res.json(finalData);
    } catch (err) {
        console.error("DB_SYNC_FAILURE:", err);
        res.status(500).json({ message: "SYNC_FAILURE" });
    }
});

export default router;