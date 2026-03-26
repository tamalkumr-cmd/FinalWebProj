import express from "express";
import {
    getAllListings,
    createListing,
    getListingById,
    addReview,
    searchFlights
} from "../controllers/listing.controller.js";
import { verifyToken } from "../middleware/auth.js";
import upload from "../middleware/multer.js"; // Ensure this path is correct

const router = express.Router();

// ✈️ Public: Get all flights for the Map/Dashboard
router.get("/", getAllListings);

// 🔍 Public: Search for specific vectors
router.get("/search", searchFlights);

// ✈️ Public: Get specific mission briefing
router.get("/:id", getListingById);

// 🛠️ Private: Deploy new vessel (Multipart for Image + Data)
// "image" must match data.append("image", file) in your frontend
router.post("/", verifyToken, upload.single("image"), createListing);

// ⭐ Private: Add review to flight
router.post("/:id/reviews", verifyToken, addReview);

export default router;