import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient } from "./apiClient";
import type { InternalAxiosRequestConfig } from "axios";

/**
 * Custom hook to use the production Axios client with automatic Auth0 Bearer token injection.
 */
export const useApiClient = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    // Request interceptor to dynamically attach the Auth0 Access Token
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (isAuthenticated) {
          try {
            const token = await getAccessTokenSilently();
            if (token && config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error("[Auth0 Axios] Failed to acquire access token:", error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Eject interceptor when component unmounts
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [getAccessTokenSilently, isAuthenticated]);

  return apiClient;
};
