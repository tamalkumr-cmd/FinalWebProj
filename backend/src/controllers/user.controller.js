import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ==========================================
// 🪪 GET PERSONNEL DOSSIER (PROFILE)
// ==========================================
export const getProfile = async(req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            // 🛰️ EXTENDED SELECT: Ensuring all UI elements have data
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                photoUrl: true,
                empId: true,
                designation: true,
                bio: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) return res.status(404).json({ error: "PERSONNEL_NOT_FOUND" });

        res.json(user);
    } catch (err) {
        console.error("❌ [PROFILE_FETCH_FAIL]:", err);
        res.status(500).json({ error: "Internal server error during dossier retrieval" });
    }
};

// ==========================================
// 🛠️ UPDATE PERSONNEL DATA
// ==========================================
export const updateProfile = async(req, res) => {
    try {
        const { name, phone, bio, designation } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name,
                phone,
                bio,
                designation
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                photoUrl: true,
                designation: true
            }
        });

        res.json(updatedUser);
    } catch (err) {
        console.error("❌ [PROFILE_UPDATE_FAIL]:", err);
        res.status(500).json({ error: "Failed to update personnel records" });
    }
};

// ==========================================
// 🔍 SEARCH PERSONNEL (START_CHAT HANDSHAKE)
// ==========================================
export const searchPersonnel = async(req, res) => {
    try {
        const { query } = req.query;

        // Return empty if search is too short to save resources
        if (!query || query.length < 2) return res.json([]);

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { empId: { contains: query, mode: 'insensitive' } }
                ],
                // 🛡️ SECURITY: Don't show the requester in their own search
                NOT: { id: req.user.id }
            },
            select: {
                id: true,
                name: true,
                photoUrl: true,
                designation: true,
                empId: true
            },
            take: 10 // Limit results for clean UI
        });

        res.json(users);
    } catch (err) {
        console.error("❌ [SEARCH_SIGNAL_LOST]:", err);
        res.status(500).json({ error: "Search frequency interrupted" });
    }
};