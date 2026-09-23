/**
 * Custom operational API Error class for standard error handling across Express
 */
export declare class ApiError extends Error {
    statusCode: number;
    message: string;
    success: boolean;
    errors: unknown[];
    data: unknown;
    constructor(statusCode: number, message?: string, errors?: unknown[], stack?: string);
}
//# sourceMappingURL=Api_Errot.d.ts.map