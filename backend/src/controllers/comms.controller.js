import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📥 FETCH INBOX (ACTIVE_FREQUENCIES)
export const getInbox = async(req, res) => {
    try {
        const userId = req.user.id;

        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: "desc" },
            include: {
                sender: { select: { id: true, name: true, photoUrl: true, designation: true } },
                receiver: { select: { id: true, name: true, photoUrl: true, designation: true } },
            },
        });

        const contacts = {};
        messages.forEach((msg) => {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;

            // 🛡️ Safety guard for deleted users or self-chats
            if (partner && partner.id !== userId && !contacts[partner.id]) {
                contacts[partner.id] = {
                    ...partner,
                    // 🖼️ If text is empty but image exists, show "Photo" in preview
                    lastMessage: msg.text || (msg.imageUrl ? "📷 Photo" : ""),
                    timestamp: msg.createdAt,
                    // 🔔 unread check
                    unread: !msg.isSeen && msg.receiverId === userId,
                };
            }
        });

        res.json(Object.values(contacts));
    } catch (err) {
        console.error("INBOX_ERR:", err);
        res.status(500).json({ error: "INBOX_SYNC_FAILURE" });
    }
};

// 🛰️ TRANSMIT MESSAGE (SEND)
export const sendMessage = async(req, res) => {
    try {
        // 🖼️ Added imageUrl to destructuring
        const { receiverId, text, listingId, imageUrl } = req.body;
        const senderId = req.user.id;

        // Validation: Must have EITHER text OR an image
        if (!receiverId || (!text && !imageUrl)) {
            return res.status(400).json({ error: "MISSING_DATA" });
        }

        const newMessage = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                text: text || null,
                imageUrl: imageUrl || null, // 🛰️ Support for tactical visuals
                listingId: listingId || null,
            },
            include: {
                sender: { select: { name: true, photoUrl: true } }
            },
        });

        res.status(201).json(newMessage);
    } catch (err) {
        console.error("SEND_ERR:", err);
        res.status(500).json({ error: "TRANSMISSION_FAILED" });
    }
};

// 📂 FETCH CHAT HISTORY
export const getChatHistory = async(req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.user.id;

        const history = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: "asc" },
        });

        // 🛡️ MARK AS SEEN: Clear unread status for the current user
        await prisma.message.updateMany({
            where: {
                senderId: partnerId,
                receiverId: userId,
                isSeen: false
            },
            data: { isSeen: true },
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "HISTORY_DECRYPTION_FAILED" });
    }
};