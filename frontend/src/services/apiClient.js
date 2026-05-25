// PURPOSE: Centralizes backend HTTP access, base URL configuration, and API error normalization.
// USAGE: Domain service modules import `apiClient`; React components never call Axios directly.

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const isDevelopment = import.meta.env.DEV;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (isDevelopment) {
    const method = config.method?.toUpperCase() || "GET";
    const url = `${config.baseURL || ""}${config.url || ""}`;
    console.info(`[api] ${method} ${url}`);
  }

  return config;
});

export function handleApiError(error) {
  if (error.response) {
    const responseMessage =
      error.response.data?.detail ||
      error.response.data?.message ||
      "The server returned an error.";

    return {
      message: responseMessage,
      status: error.response.status,
      data: error.response.data,
      isNetworkError: false,
    };
  }

  if (error.request) {
    return {
      message: "Unable to reach the API. Check that the backend is running.",
      status: null,
      data: null,
      isNetworkError: true,
    };
  }

  return {
    message: error.message || "Unexpected API error.",
    status: null,
    data: null,
    isNetworkError: false,
  };
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(handleApiError(error)),
);

export default apiClient;
