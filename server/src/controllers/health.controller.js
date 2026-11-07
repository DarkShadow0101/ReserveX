// src/controllers/health.controller.js
// Health check controller for monitoring service availability

const { sendSuccess } = require('../utils/response');

/**
 * GET /health
 */
function getHealth(req, res) {
  const healthData = {
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };

  return sendSuccess(res, 200, 'ReserveX service is healthy', healthData);
}

module.exports = {
  getHealth
};
