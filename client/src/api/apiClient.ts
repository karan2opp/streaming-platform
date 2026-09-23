import axios, { type AxiosError, type AxiosInstance } from "axios";

// 1. Define Standard API Response & Error Types
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode = 500, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

// 2. Base Configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 3. Response Interceptor for Error Handling & Normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    let errorMessage = "An unexpected error occurred. Please try again.";
    let statusCode = 500;

    if (error.response) {
      // Server responded with a status code outside 2xx
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || `Request failed with status ${statusCode}`;

      if (statusCode === 401) {
        console.warn("[Axios] Unauthorized request (401). Token may be expired or missing.");
      } else if (statusCode === 403) {
        console.warn("[Axios] Forbidden request (403). Insufficient permissions.");
      }
    } else if (error.request) {
      // Request was made but no response received (Network Error)
      errorMessage = "Network error. Please check your internet connection.";
      statusCode = 0;
    } else {
      // Error setting up the request
      errorMessage = error.message;
    }

    return Promise.reject(new ApiError(errorMessage, statusCode, error.response?.data));
  }
);
