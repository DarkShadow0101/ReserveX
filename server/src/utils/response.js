// src/utils/response.js
// Standardized JSON response format for all API endpoints

/**
 * Send a consistent successful HTTP JSON response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Human-readable success message
 * @param {any} data - Payload data to return
 */
function sendSuccess(res, statusCode = 200, message = 'Success', data = null) {
  const payload = {
    success: true,
    message
  };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
}

/**
 * Format a standardized error payload
 * @param {string} message - Error description
 * @param {any} details - Field-level errors or stack trace details
 */
function formatErrorPayload(message, details = null) {
  const payload = {
    success: false,
    error: {
      message
    }
  };

  if (details !== null) {
    payload.error.details = details;
  }

  return payload;
}

module.exports = {
  sendSuccess,
  formatErrorPayload
};
