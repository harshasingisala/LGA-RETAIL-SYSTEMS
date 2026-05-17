// PURPOSE: Centralizes backend constants used across configuration, routing, and responses.
// USAGE: Import constants from this module instead of duplicating literals.

export const VALID_APP_ENVS = new Set(["development", "production", "test"]);

export const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
];

export const HEALTH_STATUS = Object.freeze({
  OK: "ok",
  DEGRADED: "degraded",
  ERROR: "error",
});

export const DATABASE_STATUS = Object.freeze({
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
});
