// src/middlewares/errorHandler.js
//
// Centralized global error handling middleware for Express.
// Must have 4 parameters (err, req, res, next) so Express recognizes it as an error handler.
//
// Responsibilities:
//   - Preserve intentional client/application HTTP errors (400, 401, 403, 404, 409, 422).
//   - Catch unexpected errors, log them on the server side, and return a sanitized 500 response.
//   - Ensure sensitive internals (stack traces, DB credentials, secrets, paths) are never sent to clients.

function errorHandler(err, req, res, _next) {
  // If headers have already been sent to the client, delegate to the default Express handler
  if (res.headersSent) {
    return _next(err);
  }

  // Determine HTTP status code
  const statusCode = err.statusCode || 500;
  const isInternalServerError = statusCode >= 500;

  // Log error details on server side for debugging
  if (isInternalServerError || process.env.NODE_ENV === "development") {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // For 500 errors, send a generic message to prevent leaking implementation details
  const message = isInternalServerError
    ? "Internal server error."
    : (err.message || "An unexpected error occurred.");

  const responseBody = {
    success: false,
    message,
    ...(err.details && { errors: err.details }),
  };

  return res.status(statusCode).json(responseBody);
}

module.exports = { errorHandler };
