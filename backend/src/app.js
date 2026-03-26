import express from "express";
import cors from "cors";

// 1. Import Routes
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import chatRoutes from "./routes/chat.routes.js"; // 👈 ADD THIS IMPORT

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// 2. Register the routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes); // 👈 REGISTER THE CHAT ROUTE

// Health check
app.get("/", (req, res) => {
    res.json({ status: "Backend is alive 🫀" });
});

export default app;