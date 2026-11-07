// src/routes/auth.routes.js
// Authentication routes: register, login, and profile retrieval

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const { authenticate } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');

// Public route: Register with validation and rate limiting
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);

// Public route: Login with validation and rate limiting
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

// Protected route: Retrieve current authenticated user profile
router.get('/me', authenticate, authController.me);

module.exports = router;
