import { Router } from "express";
import { handleImageKitWebhook, triggerTestWebhook } from "./webhookController.js";

const router = Router();

// ImageKit Webhook Receiver
router.post("/imagekit", handleImageKitWebhook);

// Local Development Test Webhook Trigger
router.post("/test-trigger", triggerTestWebhook);

export default router;
