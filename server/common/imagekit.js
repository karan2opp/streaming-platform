import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";
export const imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
});
/**
 * Generate HMAC authentication parameters for client-side direct upload
 */
export const getUploadAuthParams = () => {
    if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error("ImageKit configuration keys are missing in environment variables.");
    }
    return imagekit.getAuthenticationParameters();
};
//# sourceMappingURL=imagekit.js.map