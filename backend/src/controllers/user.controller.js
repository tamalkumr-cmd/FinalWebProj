import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProfile = async(req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            // 💥 THE FIX: Added 'id: true' so the frontend chat knows who you are!
            select: { id: true, name: true, email: true, phone: true }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

export const updateProfile = async(req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, phone }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to update profile" });
    }
};