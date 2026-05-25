// PURPOSE: Applies API security headers and basic per-IP abuse throttling.
// USAGE: Mount before API routers in server.js.

import { config } from "../config/env.js";

const rateLimitBuckets = new Map();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_CLIENTS = 10000;

export function securityHeaders(request, response, next) {
  response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  response.setHeader("Cross-Origin-Resource-Policy", "same-site");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");

  if (config.appEnv === "production") {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
}

export function apiRateLimit(request, response, next) {
  const now = Date.now();
  const key = request.ip || "unknown";
  const current = rateLimitBuckets.get(key);
  const bucket =
    current && current.resetAt > now
      ? current
      : { count: 0, resetAt: now + RATE_WINDOW_MS };

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);

  response.setHeader("RateLimit-Limit", String(config.apiRateLimitMax));
  response.setHeader("RateLimit-Remaining", String(Math.max(0, config.apiRateLimitMax - bucket.count)));
  response.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > config.apiRateLimitMax) {
    response.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    response.status(429).json({
      error: {
        message: "Too many requests. Try again later.",
        status: 429,
      },
    });
    return;
  }

  if (rateLimitBuckets.size > MAX_TRACKED_CLIENTS) {
    for (const [storedKey, storedBucket] of rateLimitBuckets) {
      if (storedBucket.resetAt <= now) {
        rateLimitBuckets.delete(storedKey);
      }
    }

    while (rateLimitBuckets.size > MAX_TRACKED_CLIENTS) {
      const oldestKey = rateLimitBuckets.keys().next().value;
      rateLimitBuckets.delete(oldestKey);
    }
  }

  next();
}
