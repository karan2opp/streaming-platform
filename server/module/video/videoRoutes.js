import { Router } from "express";
import { getUploadAuth, createVideo, getVideos, getVideoById, incrementViewCount, } from "./videoController.js";
const router = Router();
// ImageKit authentication parameters for client-side direct upload
router.get("/upload-auth", getUploadAuth);
// Video CRUD & feed queries
router.get("/", getVideos);
router.post("/", createVideo);
router.get("/:id", getVideoById);
router.post("/:id/view", incrementViewCount);
export default router;
//# sourceMappingURL=videoRoutes.js.map