// PURPOSE: Returns consistent JSON for unknown API routes.
// USAGE: Registered after all routes in `server.js`.

export function notFound(request, response) {
  response.status(404).json({
    error: {
      message: `Route not found: ${request.method} ${request.originalUrl}`,
      status: 404,
    },
  });
}
