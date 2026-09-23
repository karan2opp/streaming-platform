import {} from "express";
import { getUploadAuthParams } from "../../common/imagekit.js";
import { prisma } from "../../common/db.js";
import { ApiResponse } from "../../common/Api_Response.js";
import { ApiError } from "../../common/Api_Errot.js";
/**
 * Get ImageKit HMAC authentication signatures for direct client upload
 */
export const getUploadAuth = async (req, res) => {
    try {
        const authParams = getUploadAuthParams();
        const response = new ApiResponse(200, {
            ...authParams,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        }, "ImageKit Auth Parameters generated successfully");
        res.status(200).json(response);
    }
    catch (error) {
        const apiErr = new ApiError(500, error.message || "Failed to generate upload auth signatures");
        res.status(500).json(apiErr);
    }
};
/**
 * Register a newly uploaded video metadata in PostgreSQL
 */
export const createVideo = async (req, res) => {
    try {
        const { title, description, ikFileId, url, thumbnailUrl, hlsUrl, duration, category, tags } = req.body;
        if (!title || !ikFileId || !url) {
            throw new ApiError(400, "Missing required fields: title, ikFileId, and url are required");
        }
        // Construct default dynamic HLS URL and Thumbnail URL if not explicitly provided
        const computedThumbnailUrl = thumbnailUrl || `${url}/tr:so-2,w-600,h-340`;
        const computedHlsUrl = hlsUrl || `${url}/ik-master.m3u8`;
        const video = await prisma.video.create({
            data: {
                title,
                description: description || "",
                ikFileId,
                url,
                thumbnailUrl: computedThumbnailUrl,
                hlsUrl: computedHlsUrl,
                duration: duration ? parseFloat(duration) : 0,
                category: category || "General",
                tags: Array.isArray(tags) ? tags : [],
                status: "READY",
            },
        });
        const response = new ApiResponse(201, video, "Video metadata saved successfully");
        res.status(201).json(response);
    }
    catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json(error);
        }
        else {
            const err = new ApiError(500, error.message || "Failed to save video metadata");
            res.status(500).json(err);
        }
    }
};
/**
 * Get list of videos with pagination, search, and category filter
 */
export const getVideos = async (req, res) => {
    try {
        const { category, search, page = "1", limit = "12" } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (category && category !== "All") {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        const [videos, total] = await Promise.all([
            prisma.video.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
            }),
            prisma.video.count({ where }),
        ]);
        const response = new ApiResponse(200, {
            videos,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
        }, "Videos retrieved successfully");
        res.status(200).json(response);
    }
    catch (error) {
        const err = new ApiError(500, error.message || "Failed to fetch videos");
        res.status(500).json(err);
    }
};
/**
 * Get single video details by ID
 */
export const getVideoById = async (req, res) => {
    try {
        const id = String(req.params.id);
        const video = await prisma.video.findUnique({ where: { id } });
        if (!video) {
            throw new ApiError(404, "Video not found");
        }
        const response = new ApiResponse(200, video, "Video details retrieved");
        res.status(200).json(response);
    }
    catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json(error);
        }
        else {
            const err = new ApiError(500, error.message || "Failed to fetch video details");
            res.status(500).json(err);
        }
    }
};
/**
 * Increment view count for a video
 */
export const incrementViewCount = async (req, res) => {
    try {
        const id = String(req.params.id);
        const video = await prisma.video.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
        const response = new ApiResponse(200, { views: video.views }, "View count updated");
        res.status(200).json(response);
    }
    catch (error) {
        const err = new ApiError(500, error.message || "Failed to update view count");
        res.status(500).json(err);
    }
};
//# sourceMappingURL=videoController.js.map