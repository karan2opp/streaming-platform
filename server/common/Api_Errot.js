/**
 * Custom operational API Error class for standard error handling across Express
 */
export class ApiError extends Error {
    statusCode;
    message;
    success;
    errors;
    data;
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
//# sourceMappingURL=Api_Errot.js.map