import { type Request, type Response } from "express";
/**
 * Handle incoming Webhook events from ImageKit CDN
 * ImageKit sends webhook payloads for file uploads and video transcoding events
 */
export declare const handleImageKitWebhook: (req: Request, res: Response) => Promise<void>;
/**
 * Local development helper to trigger video status updates and SSE events manually
 */
export declare const triggerTestWebhook: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=webhookController.d.ts.map