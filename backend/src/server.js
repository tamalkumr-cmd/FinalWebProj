import "dotenv/config";
import { createServer } from "http"; // 👈 Import Node's HTTP module
import { Server } from "socket.io"; // 👈 Import Socket.io
import { PrismaClient } from "@prisma/client";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

console.log("DB URL:", process.env.DATABASE_URL); // temp debug

// 💥 1. WRAP EXPRESS WITH HTTP SERVER
const httpServer = createServer(app);

// 💥 2. INITIALIZE SOCKET.IO
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Must match your React port exactly
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 💥 3. REAL-TIME CHAT LOGIC
io.on("connection", (socket) => {
    console.log("⚡ User connected to chat socket:", socket.id);

    // Join a specific Gig's room
    socket.on("join_chat", (listingId) => {
        socket.join(listingId);
    });

    // Handle incoming messages

    socket.on("send_message", async(data) => {
        const { listingId, text, senderId } = data;

        // 💥 NEW: Safety check to prevent server crashes!
        if (!senderId) {
            console.error("❌ Socket Error: Missing senderId from frontend!");
            return; // Stop here, don't crash Prisma
        }

        try {
            const savedMsg = await prisma.message.create({
                data: { text, listingId, senderId },
                include: { sender: { select: { name: true } } }
            });
            io.to(listingId).emit("receive_message", savedMsg);
        } catch (err) {
            console.error("Socket save msg error:", err);
        }
    });


    // Handle Typing Indicator
    socket.on("typing", (data) => {
        socket.to(data.listingId).emit("display_typing", data);
    });

    // Handle "Seen" Status updates
    socket.on("mark_seen", async(data) => {
        try {
            const { messageId, listingId } = data;
            await prisma.message.update({
                where: { id: messageId },
                data: { isSeen: true }
            });
            io.to(listingId).emit("message_updated");
        } catch (err) {
            console.error("Socket mark seen error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
});

// 💥 4. LISTEN USING httpServer (NOT app.listen)
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with WebSockets 🚀`);
});