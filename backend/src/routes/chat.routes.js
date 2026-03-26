import express from 'express';
import {
    getMessages,
    getInbox,
    getChatHistory,
    sendMessage,
    deleteMessage // 👈 Added for scrubbing transmissions
} from '../controllers/chat.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// 🛰️ FLIGHT-SPECIFIC SECTORS (GROUP)
// ==========================================
// Fetch messages linked to a specific aircraft/listing room
router.get('/listing/:listingId', verifyToken, getMessages);

// ==========================================
// 📟 PRIVATE COMMS (DIRECT MESSAGING)
// ==========================================

// 📥 SCAN_INBOX: Fetch all personnel with active frequencies
router.get('/inbox', verifyToken, getInbox);

// 📂 DECRYPT_HISTORY: Fetch 1:1 message history (also marks as SEEN)
router.get('/history/:partnerId', verifyToken, getChatHistory);

// ⚡ INITIATE_TRANSMISSION: Save a new packet (Supports Text + Images)
router.post('/send', verifyToken, sendMessage);

// 🗑️ SCRUB_MESSAGE: Delete a message from the database (Unsend)
router.delete('/message/:messageId', verifyToken, deleteMessage);

export default router;