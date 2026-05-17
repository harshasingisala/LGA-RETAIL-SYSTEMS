// PURPOSE: Single source of truth for route paths and storage keys.

export const ROUTES = {
  login:     "/login",
  dashboard: "/dashboard",
  billing:   "/billing",
  inventory: "/inventory",
  sales:     "/sales",
  analytics: "/analytics",
};

export const APP_STORAGE_KEYS = {
  // Only UI preferences remain in localStorage.
  // Auth is now handled by Supabase (no session in localStorage).
  theme: "lga:theme",
  sidebarCollapsed: "lga:sidebar_collapsed",
};
