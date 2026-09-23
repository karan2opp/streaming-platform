/**
 * Custom operational API Error class for standard error handling across Express
 */
export class ApiError extends Error {
  public statusCode: number;
  public message: string;
  public success: boolean;
  public errors: unknown[];
  public data: unknown;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: unknown[] = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
