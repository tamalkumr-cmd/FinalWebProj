import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();
const httpServer = createServer(app);

// 📡 TRACKING SYSTEM: Map to store active personnel (UserId -> SocketId)
const onlinePersonnel = new Map();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("⚡ [SIGNAL_LOCKED]: New connection established ->", socket.id);

    // 📟 JOIN PERSONAL FREQUENCY & BROADCAST STATUS
    socket.on("join_personal_frequency", (userId) => {
        if (userId) {
            const uid = String(userId);
            socket.join(uid);

            // Register as Online
            onlinePersonnel.set(uid, socket.id);
            console.log(`👤 [PERSONNEL]: User ${uid} is ONLINE.`);

            // Notify everyone that this pilot is now active
            io.emit("user_status_change", { userId: uid, status: "online" });
        }
    });

    // 📩 MESSAGE TRANSMISSION
    socket.on("send_message", async(data) => {
        const { text, senderId, receiverId, listingId, imageUrl } = data;

        if (!senderId || (!text && !imageUrl) || (!receiverId && !listingId)) return;

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

            // 🛡️ ECHO CANCELLATION ROUTING
            if (receiverId) {
                socket.to(String(receiverId)).emit("receive_message", savedMsg);
            }
            if (listingId) {
                socket.to(String(listingId)).emit("receive_message", savedMsg);
            }

            console.log(`📨 [COMMS]: Packet routed from ${senderId}`);
        } catch (err) {
            console.error("❌ [DB_WRITE_FAILURE]:", err.message);
        }
    });

    // 🗑️ MESSAGE SCRUBBING (UNSEND)
    socket.on("delete_message", async(data) => {
        const { messageId, receiverId } = data;
        try {
            await prisma.message.delete({ where: { id: messageId } });
            // Alert receiver to remove message from UI
            socket.to(String(receiverId)).emit("message_scrubbed", messageId);
        } catch (err) {
            console.error("❌ [SCRUB_FAILURE]:", err.message);
        }
    });

    // ⌨️ TYPING TELEMETRY
    socket.on("typing_start", (data) => {
        const target = data.receiverId || data.listingId;
        socket.to(String(target)).emit("display_typing", {
            senderId: data.senderId,
            typing: true
        });
    });

    socket.on("typing_stop", (data) => {
        const target = data.receiverId || data.listingId;
        socket.to(String(target)).emit("display_typing", {
            senderId: data.senderId,
            typing: false
        });
    });

    // 📞 VOICE/VIDEO CALLS
    socket.on("call_user", (data) => {
        io.to(String(data.to)).emit("incoming_call", {
            from: data.from,
            signal: data.signalData,
            type: data.type,
            name: data.name
        });
    });

    socket.on("answer_call", (data) => {
        io.to(String(data.to)).emit("call_accepted", data.signal);
    });

    // 🛑 SIGNAL DISCONNECT
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
            console.log(`👤 [PERSONNEL]: User ${disconnectedUid} is OFFLINE.`);
            io.emit("user_status_change", { userId: disconnectedUid, status: "offline" });
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 Sky_Link.os TACTICAL CORE ONLINE
    📡 PORT: ${PORT}
    🟢 STATUS TRACKING: ACTIVE
    ⌨️ TYPING ENGINE: ACTIVE
    ========================================
    `);
});