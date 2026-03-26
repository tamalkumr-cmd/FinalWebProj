import express from "express";
import { createOrder, getMyOrders } from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
router.post("/", verifyToken, createOrder);
router.get("/me", verifyToken, getMyOrders);
export default router;