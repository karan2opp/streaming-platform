import { apiClient } from "../apiClient";

export interface HealthResponse {
  status: string;
  message: string;
}

export interface ProtectedResponse {
  message: string;
  authInfo: Record<string, unknown>;
}

export const healthService = {
  // Public Endpoint
  getHealthStatus: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>("/health");
    return response.data;
  },

  // Protected Endpoint (Auth0 token attached automatically via useApiClient hook)
  getProtectedData: async (): Promise<ProtectedResponse> => {
    const response = await apiClient.get<ProtectedResponse>("/api/protected");
    return response.data;
  },
};
