import ImageKit from "imagekit";
export declare const imagekit: ImageKit;
/**
 * Generate HMAC authentication parameters for client-side direct upload
 */
export declare const getUploadAuthParams: () => {
    token: string;
    expire: number;
    signature: string;
};
//# sourceMappingURL=imagekit.d.ts.map