// PURPOSE: Wraps async Express handlers so rejected promises reach centralized error middleware.
// USAGE: Wrap route handlers with `asyncHandler(handler)`.

export function asyncHandler(handler) {
  return function wrappedAsyncHandler(request, response, next) {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
