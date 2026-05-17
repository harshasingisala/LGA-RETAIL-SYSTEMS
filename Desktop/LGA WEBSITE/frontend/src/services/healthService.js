// PURPOSE: Provides health-check API functions for frontend operational status views.
// USAGE: Pages and hooks call `getHealth()` instead of calling the API client directly.

import apiClient from "./apiClient";

export async function getHealth() {
  const response = await apiClient.get("/health");
  return response.data;
}
