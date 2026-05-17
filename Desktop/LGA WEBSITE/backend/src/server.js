// PURPOSE: Creates, configures, and starts the Express backend application.
// USAGE: Run with `npm run dev` locally or `npm start` in production.

import cors from "cors";
import express from "express";

import { config } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { healthRouter } from "./routes/healthRoutes.js";

const app = express();

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.use("/api", healthRouter);
app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, "0.0.0.0", () => {
  console.info(
    `Backend running | env=${config.appEnv} | version=${config.appVersion} | port=${config.port}`,
  );
});

function shutdown(signal) {
  console.info(`Received ${signal}; shutting down backend`);
  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  shutdown("uncaughtException");
});
