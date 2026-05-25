// PURPOSE: Provides operational health checks including Supabase REST reachability.
// USAGE: Health routes call `getHealthStatus()` to build the API health contract.

import { config } from "../config/env.js";
import { DATABASE_STATUS, HEALTH_STATUS } from "../utils/constants.js";

async function probeSupabaseRest() {
  const startedAt = performance.now();
  const { getSupabaseClient } = await import("./supabaseClient.js");
  getSupabaseClient();

  try {
    const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: config.supabaseKey,
        Authorization: `Bearer ${config.supabaseKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const latencyMs = Number((performance.now() - startedAt).toFixed(2));

    if (response.status >= 500) {
      return {
        status: DATABASE_STATUS.DISCONNECTED,
        latencyMs,
        error: `Supabase REST returned status ${response.status}`,
      };
    }

    return {
      status: DATABASE_STATUS.CONNECTED,
      latencyMs,
    };
  } catch (error) {
    return {
      status: DATABASE_STATUS.DISCONNECTED,
      latencyMs: Number((performance.now() - startedAt).toFixed(2)),
      error: error.message,
    };
  }
}

export async function getHealthStatus() {
  const database =
    config.dataMode === "local"
      ? { status: DATABASE_STATUS.LOCAL }
      : await probeSupabaseRest();
  const isConnected = database.status === DATABASE_STATUS.CONNECTED;
  const isAvailable = isConnected || database.status === DATABASE_STATUS.LOCAL;

  return {
    status: isAvailable ? HEALTH_STATUS.OK : HEALTH_STATUS.DEGRADED,
    timestamp: new Date().toISOString(),
    version: config.appVersion,
    database: database.status,
    environment: config.appEnv,
  };
}
