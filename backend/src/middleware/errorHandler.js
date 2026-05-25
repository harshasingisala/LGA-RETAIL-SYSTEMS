// PURPOSE: Centralizes Express error responses and avoids leaking internals in production.
// USAGE: Registered last in `server.js`.

import { config } from "../config/env.js";

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message =
    config.appEnv === "production" && status === 500
      ? "Internal server error"
      : error.message || "Internal server error";

  response.status(status).json({
    error: {
      message,
      status,
    },
  });
}
