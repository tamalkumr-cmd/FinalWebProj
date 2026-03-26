import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token missing or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token has expired" });
        }

        // Log critical server errors, but don't leak details to client
        if (err.message.includes("JWT_SECRET")) {
            console.error("CRITICAL ERROR:", err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        return res.status(401).json({ error: "Invalid token" });
    }
};