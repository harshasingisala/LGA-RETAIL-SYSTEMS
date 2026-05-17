// PURPOSE: Owns singleton Supabase client initialization for the backend process.
// USAGE: Import `getSupabaseClient()` anywhere Supabase access is required.

import { createClient } from "@supabase/supabase-js";

import { config } from "../config/env.js";

let supabaseClient = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          "X-Client-Info": "lga-website-backend",
        },
      },
    });
  }

  return supabaseClient;
}
