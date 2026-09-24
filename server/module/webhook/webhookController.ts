import { type Request, type Response } from "express";
import { prisma } from "../../common/db.js";
import { ApiResponse } from "../../common/Api_Response.js";
import { ApiError } from "../../common/Api_Errot.js";
import { sseService } from "../../common/sseService.js";

/**
 * Handle incoming Webhook events from ImageKit CDN
 * ImageKit sends webhook payloads for file uploads and video transcoding events
 */
export const handleImageKitWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log("[Webhook Received from ImageKit]", JSON.stringify(payload, null, 2));

    // ImageKit payload usually contains type, fileId, or data object
    const type = payload.type || payload.event || "video.encoding.complete";
    const ikFileId = payload.fileId || payload.data?.fileId || payload.id;

    if (!ikFileId) {
      res.status(200).json(new ApiResponse(200, { received: true }, "Webhook received without fileId"));
      return;
    }

    // Determine new status
    let newStatus = "READY";
    if (type.includes("error") || type.includes("failed")) {
      newStatus = "FAILED";
    }

    // Find and update video in database by ImageKit File ID
    const existingVideo = await prisma.video.findFirst({
      where: { ikFileId: String(ikFileId) },
    });

    if (existingVideo) {
      const updatedVideo = await prisma.video.update({
        where: { id: existingVideo.id },
        data: { status: newStatus },
      });

      // Broadcast real-time SSE event to all connected React clients
      sseService.broadcast("VIDEO_STATUS_UPDATED", updatedVideo);
      console.log(`[Webhook Success] Updated Video ${updatedVideo.id} status to ${newStatus}`);
    } else {
      console.warn(`[Webhook Warning] No video found matching ikFileId: ${ikFileId}`);
    }

    res.status(200).json(new ApiResponse(200, { success: true }, "Webhook processed successfully"));
  } catch (error: any) {
    console.error("[Webhook Error]", error);
    res.status(500).json(new ApiError(500, error.message || "Failed to process ImageKit webhook"));
  }
};

/**
 * Local development helper to trigger video status updates and SSE events manually
 */
export const triggerTestWebhook = async (req: Request, res: Response) => {
  try {
    const { videoId, ikFileId, status = "READY" } = req.body;

    let video;
    if (videoId) {
      video = await prisma.video.update({
        where: { id: String(videoId) },
        data: { status: String(status) },
      });
    } else if (ikFileId) {
      const found = await prisma.video.findFirst({ where: { ikFileId: String(ikFileId) } });
      if (found) {
        video = await prisma.video.update({
          where: { id: found.id },
          data: { status: String(status) },
        });
      }
    }

    if (!video) {
      throw new ApiError(404, "Target video not found");
    }

    // Broadcast SSE update
    sseService.broadcast("VIDEO_STATUS_UPDATED", video);

    res.status(200).json(new ApiResponse(200, video, `Video status manually updated to ${status} and broadcasted via SSE`));
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res.status(500).json(new ApiError(500, error.message || "Failed to trigger test webhook"));
    }
  }
};
