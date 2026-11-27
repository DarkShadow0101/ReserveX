const rateLimit = require('express-rate-limit');

const isTest = () => process.env.NODE_ENV === 'test';
const isProd = () => process.env.NODE_ENV === 'production';

// 1. Strict limiter for authentication routes (/register, /login) against brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: () => (isProd() ? 20 : 100),
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTest,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// 2. General API burst limiter across /api/* (skips webhooks so payment callbacks are never throttled)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isTest() || req.originalUrl.startsWith('/api/payments/webhook'),
  message: {
    success: false,
    message: 'Rate limit exceeded. Please slow down and try again shortly.'
  }
});

// 3. Dedicated limiter on ticket-hold & payment-order creation to prevent automated inventory hoarding
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTest,
  message: {
    success: false,
    message: 'Too many reservation attempts. Please wait a few minutes before creating another hold.'
  }
});

module.exports = {
  authLimiter,
  apiLimiter,
  bookingLimiter
};
