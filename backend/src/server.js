import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import app from "./app.js";

const PORT = process.env.PORT || 10000; // Render uses 10000 by default
const prisma = new PrismaClient();
const httpServer = createServer(app);

const onlinePersonnel = new Map();

const io = new Server(httpServer, {
    cors: {
        // 🛰️ TACTICAL ADJUSTMENT: Allow all origins for deployment flexibility
        origin: true,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("⚡ [SIGNAL_LOCKED]: New connection established ->", socket.id);

    socket.on("join_personal_frequency", (userId) => {
        if (userId) {
            const uid = String(userId);
            socket.join(uid);
            onlinePersonnel.set(uid, socket.id);
            console.log(`👤 [PERSONNEL]: User ${uid} is ONLINE.`);
            io.emit("user_status_change", { userId: uid, status: "online" });
        }
    });

    socket.on("send_message", async(data) => {
        const { text, senderId, receiverId, listingId, imageUrl } = data;
        if (!senderId || (!text && !imageUrl)) return;

        try {
            const savedMsg = await prisma.message.create({
                data: {
                    text: text || "",
                    imageUrl: imageUrl || null,
                    senderId,
                    receiverId: receiverId || null,
                    listingId: listingId || null
                },
                include: {
                    sender: { select: { name: true, photoUrl: true, designation: true } }
                }
            });

            if (receiverId) socket.to(String(receiverId)).emit("receive_message", savedMsg);
            if (listingId) socket.to(String(listingId)).emit("receive_message", savedMsg);

            console.log(`📨 [COMMS]: Packet routed from ${senderId}`);
        } catch (err) {
            console.error("❌ [DB_WRITE_FAILURE]:", err.message);
        }
    });

    // ... (keep your delete_message, typing, and call logic as they are)

    socket.on("disconnect", () => {
        let disconnectedUid = null;
        for (let [uid, sid] of onlinePersonnel.entries()) {
            if (sid === socket.id) {
                disconnectedUid = uid;
                onlinePersonnel.delete(uid);
                break;
            }
        }
        if (disconnectedUid) {
            io.emit("user_status_change", { userId: disconnectedUid, status: "offline" });
        }
    });
});

// 🚀 Start the Tactical Core
httpServer.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 Sky_Link.os TACTICAL CORE ONLINE
    📡 PORT: ${PORT}
    🟢 STATUS TRACKING: ACTIVE
    ========================================
    `);
});