const rateLimit = require('express-rate-limit');

// Protects /register and /login from brute-force password guessing and spam
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 15, // Allow max 15 requests per IP inside that 15-minute window
  standardHeaders: true, // Sends standard RateLimit-* headers in response
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test', // Do not block automated test runs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

module.exports = {
  authLimiter
};
