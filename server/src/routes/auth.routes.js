const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// Public routes: Rate Limiter -> Zod Validation -> Controller
router.post('/register', authLimiter, validate(registerSchema), authController.RegisterUser);
router.post('/login', authLimiter, validate(loginSchema), authController.loginUser);

// Protected route: Verify JWT -> Controller
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
