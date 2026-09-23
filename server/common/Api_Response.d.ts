/**
 * Standard API Response class for uniform API success payloads
 */
export declare class ApiResponse<T = unknown> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
    constructor(statusCode: number, data: T, message?: string);
}
//# sourceMappingURL=Api_Response.d.ts.map