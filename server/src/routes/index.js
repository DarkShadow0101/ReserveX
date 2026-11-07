// src/routes/index.js
// Central router combining all sub-routes

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

// Health endpoint (kept top-level for container/load balancer health checks)
router.use('/health', healthRoutes);

// Versioned API routes
router.use('/api/v1/auth', authRoutes);

module.exports = router;
