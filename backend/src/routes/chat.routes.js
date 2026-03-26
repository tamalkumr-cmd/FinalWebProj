import express from 'express';
import { getMessages } from '../controllers/chat.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/:listingId', verifyToken, getMessages);
export default router;