import { Router } from "express";
import { getUploadAuth, createVideo, getVideos, getVideoById, incrementViewCount, subscribeVideoEvents, } from "./videoController.js";
const router = Router();
// Server-Sent Events (SSE) real-time video stream updates
router.get("/events", subscribeVideoEvents);
// ImageKit authentication parameters for client-side direct upload
router.get("/upload-auth", getUploadAuth);
// Video CRUD & feed queries
router.get("/", getVideos);
router.post("/", createVideo);
router.get("/:id", getVideoById);
router.post("/:id/view", incrementViewCount);
export default router;
//# sourceMappingURL=videoRoutes.js.map