// src/controllers/auth.controller.js
// Handles HTTP request/response cycle for authentication routes

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

/**
 * POST /api/v1/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, fullName, role } = req.body;
    const result = await authService.registerUser({ email, password, fullName, role });

    return sendSuccess(res, 201, 'User registered successfully', result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    return sendSuccess(res, 200, 'Login successful', result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me
 */
async function me(req, res, next) {
  try {
    // req.user is attached by the authenticate middleware
    const user = await authService.getCurrentUser(req.user.id);

    return sendSuccess(res, 200, 'User profile fetched successfully', { user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  me
};
