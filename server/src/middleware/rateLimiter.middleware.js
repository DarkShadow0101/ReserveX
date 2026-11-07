// src/middleware/rateLimiter.middleware.js
// Rate limiting to protect auth routes from brute-force and credential stuffing attacks

const rateLimit = require('express-rate-limit');
const { formatErrorPayload } = require('../utils/response');

// Strict rate limiter for authentication routes (login / register)
// Limits each IP to 15 requests per 15-minute window
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return res.status(429).json(
      formatErrorPayload('Too many authentication attempts. Please try again after 15 minutes.')
    );
  }
});

// General API rate limiter for standard endpoints
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json(
      formatErrorPayload('Too many requests. Please slow down.')
    );
  }
});

module.exports = {
  authRateLimiter,
  apiRateLimiter
};
