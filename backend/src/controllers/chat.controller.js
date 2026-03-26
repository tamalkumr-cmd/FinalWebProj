import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fetch all previous messages when a user opens the gig page
export const getMessages = async(req, res) => {
    try {
        const { listingId } = req.params;
        const messages = await prisma.message.findMany({
            where: { listingId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { name: true } } }
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};