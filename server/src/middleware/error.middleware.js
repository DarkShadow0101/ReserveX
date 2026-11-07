// src/middleware/error.middleware.js
// Centralized Express error handler
//
// In Express, an error-handling middleware MUST accept 4 arguments: (err, req, res, next)
// This ensures any error passed to next(err) lands here.

const env = require('../config/env');
const { formatErrorPayload } = require('../utils/response');

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    // Unique constraint violation (e.g. duplicate email, unique slug)
    statusCode = 409;
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    message = `A record with this ${target} already exists.`;
  } else if (err.code === 'P2025') {
    // Record to update or delete not found
    statusCode = 404;
    message = 'Requested record not found.';
  }

  // Handle JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please authenticate again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // In development, include stack trace for easier debugging
  if (env.NODE_ENV === 'development' && statusCode === 500) {
    details = {
      stack: err.stack,
      raw: err
    };
  }

  // Always log 500 errors to the console
  if (statusCode === 500) {
    console.error('💥 UNHANDLED SERVER ERROR:', err);
  }

  return res.status(statusCode).json(formatErrorPayload(message, details));
}

module.exports = errorHandler;
