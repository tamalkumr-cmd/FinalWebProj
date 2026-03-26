import express from "express";
import { sendBriefController } from "../controllers/brief.controller.js";

const router = express.Router();

router.post("/brief", sendBriefController);

export default router;