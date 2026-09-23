import { type Request, type Response } from "express";
/**
 * Get ImageKit HMAC authentication signatures for direct client upload
 */
export declare const getUploadAuth: (req: Request, res: Response) => Promise<void>;
/**
 * Register a newly uploaded video metadata in PostgreSQL
 */
export declare const createVideo: (req: Request, res: Response) => Promise<void>;
/**
 * Get list of videos with pagination, search, and category filter
 */
export declare const getVideos: (req: Request, res: Response) => Promise<void>;
/**
 * Get single video details by ID
 */
export declare const getVideoById: (req: Request, res: Response) => Promise<void>;
/**
 * Increment view count for a video
 */
export declare const incrementViewCount: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=videoController.d.ts.map