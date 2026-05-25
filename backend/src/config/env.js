// PURPOSE: Loads, validates, and exports environment-safe backend configuration.
// USAGE: Import `config` anywhere backend runtime settings are needed.

import dotenv from "dotenv";

import { DEFAULT_ALLOWED_ORIGINS, VALID_APP_ENVS } from "../utils/constants.js";

dotenv.config({ quiet: true });

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseAllowedOrigins(value) {
  const origins = value?.trim()
    ? value.split(",").map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  if (origins.length === 0) {
    throw new Error("ALLOWED_ORIGINS must include at least one explicit origin");
  }

  if (origins.includes("*")) {
    throw new Error('Wildcard "*" is not allowed in ALLOWED_ORIGINS');
  }

  return origins;
}

function parsePort(value) {
  const port = Number.parseInt(value || "8000", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
}

function parsePositiveInteger(value, fallback, name) {
  const parsed = Number.parseInt(value || String(fallback), 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

const appEnv = (process.env.APP_ENV || "development").trim().toLowerCase();
const dataMode = (process.env.DATA_MODE || "local").trim().toLowerCase();

if (!VALID_APP_ENVS.has(appEnv)) {
  throw new Error("APP_ENV must be one of: development, production, test");
}

if (!new Set(["local", "supabase"]).has(dataMode)) {
  throw new Error("DATA_MODE must be one of: local, supabase");
}

export const config = Object.freeze({
  appEnv,
  dataMode,
  appVersion: (process.env.APP_VERSION || "1.0.0").trim(),
  port: parsePort(process.env.PORT),
  apiRateLimitMax: parsePositiveInteger(process.env.API_RATE_LIMIT_MAX, 120, "API_RATE_LIMIT_MAX"),
  supabaseUrl: dataMode === "supabase" ? requireEnv("SUPABASE_URL") : "",
  supabaseKey: dataMode === "supabase" ? requireEnv("SUPABASE_KEY") : "",
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
});
