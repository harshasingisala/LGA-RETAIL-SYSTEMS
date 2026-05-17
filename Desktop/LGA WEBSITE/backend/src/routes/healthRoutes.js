// PURPOSE: Defines operational health API routes.
// USAGE: Mounted by `server.js` under the `/api` prefix.

import { Router } from "express";

import { getHealthStatus } from "../services/healthService.js";
import { HEALTH_STATUS } from "../utils/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthRouter = Router();

healthRouter.get(
  "/health",
  asyncHandler(async (request, response) => {
    const health = await getHealthStatus();
    const statusCode = health.status === HEALTH_STATUS.OK ? 200 : 503;
    response.status(statusCode).json(health);
  }),
);
