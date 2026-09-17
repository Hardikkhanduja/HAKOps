/**
 * errorHandler.js — Central Express error-handling middleware.
 *
 * Rules (non-negotiable):
 * 1. NEVER expose stack traces, AWS SDK error codes, or DynamoDB details to clients.
 * 2. Operational errors (validation, 404s) have isOperational:true — use their message.
 * 3. All other errors get a generic safe message.
 * 4. Full error is always logged to console.error for server-side observability.
 * 5. Response is always { error: string } — no other keys.
 *
 * This prevents the class of bug where raw AWS error text (e.g. "AccessDenied",
 * "ResourceNotFoundException") leaks to the frontend and is shown to patients.
 */
'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Full error logged server-side — never sent to client
  console.error('[ErrorHandler]', {
    url:           req.url,
    method:        req.method,
    statusCode:    err.statusCode || err.status,
    isOperational: err.isOperational,
    message:       err.message,
    stack:         err.stack,
  });

  const statusCode = err.statusCode || err.status || 500;

  // Only expose the message for errors we explicitly marked as safe
  const message = err.isOperational
    ? err.message
    : 'An unexpected error occurred';

  // Exactly one key: "error" — no stack, no AWS fields, no requestId
  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;