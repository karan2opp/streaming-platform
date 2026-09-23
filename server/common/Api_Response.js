/**
 * Standard API Response class for uniform API success payloads
 */
export class ApiResponse {
    statusCode;
    data;
    message;
    success;
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}
//# sourceMappingURL=Api_Response.js.map