import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 📥 FETCH INBOX (ACTIVE_FREQUENCIES)
export const getInbox = async(req, res) => {
    try {
        const userId = req.user.id;

        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, photoUrl: true, designation: true } },
                receiver: { select: { id: true, name: true, photoUrl: true, designation: true } },
            },
        });

        if (!messages || messages.length === 0) return res.status(200).json([]);

        const contactsMap = new Map();

        messages.forEach((msg) => {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;

            if (partner && partner.id !== userId && !contactsMap.has(partner.id)) {
                contactsMap.set(partner.id, {
                    id: partner.id,
                    name: partner.name,
                    photoUrl: partner.photoUrl,
                    designation: partner.designation,
                    // 🖼️ Preview logic: Show text or a photo icon
                    lastMessage: msg.text || (msg.imageUrl ? "📷 Attachment Received" : ""),
                    timestamp: msg.createdAt,
                    // 🔔 Badge Logic
                    isSeen: msg.isSeen,
                    unread: !msg.isSeen && msg.receiverId === userId
                });
            }
        });

        res.status(200).json(Array.from(contactsMap.values()));
    } catch (error) {
        console.error("❌ [INBOX_SCAN_CRASH]:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
};

// 📂 FETCH CHAT HISTORY
export const getChatHistory = async(req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.user.id;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });

        // 🛡️ TACTICAL UPGRADE: Mark messages as seen when history is opened
        await prisma.message.updateMany({
            where: {
                senderId: partnerId,
                receiverId: userId,
                isSeen: false
            },
            data: { isSeen: true }
        });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to decrypt history" });
    }
};

// 🛰️ TRANSMIT MESSAGE (SEND)
export const sendMessage = async(req, res) => {
    try {
        const { receiverId, text, listingId, imageUrl } = req.body;
        const senderId = req.user.id;

        if (!receiverId || (!text && !imageUrl)) {
            return res.status(400).json({ error: "MISSING_DATA" });
        }

        const newMessage = await prisma.message.create({
            data: {
                text: text || "",
                imageUrl: imageUrl || null,
                senderId,
                receiverId,
                listingId: listingId || null
            },
            include: {
                sender: { select: { name: true, photoUrl: true, id: true } }
            }
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("SEND_ERR:", error);
        res.status(500).json({ error: "Failed to transmit" });
    }
};

// 🗑️ SCRUB MESSAGE (DELETE/UNSEND)
export const deleteMessage = async(req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        // 🛡️ SECURITY: Ensure only the sender can delete the message
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) return res.status(404).json({ error: "NOT_FOUND" });
        if (message.senderId !== userId) return res.status(403).json({ error: "UNAUTHORIZED" });

        await prisma.message.delete({
            where: { id: messageId }
        });

        res.status(200).json({ success: true, messageId });
    } catch (error) {
        res.status(500).json({ error: "DELETION_FAILED" });
    }
};

// 📑 FETCH SECTOR LOGS (GROUP CHAT)
export const getMessages = async(req, res) => {
    try {
        const { listingId } = req.params;
        const messages = await prisma.message.findMany({
            where: { listingId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { name: true, photoUrl: true } } }
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
};