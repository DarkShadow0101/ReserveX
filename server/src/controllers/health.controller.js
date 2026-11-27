const mongoose = require('mongoose');

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

// Health and database readiness endpoint (monitored by Render / UptimeRobot)
const getHealth = (req, res) => {
  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = DB_STATES[dbStateCode] || 'unknown';
  const isProdDbDown = process.env.NODE_ENV === 'production' && dbStateCode !== 1;

  const statusCode = isProdDbDown ? 503 : 200;

  return res.status(statusCode).json({
    success: !isProdDbDown,
    message: isProdDbDown
      ? 'ReserveX API degraded: database disconnected'
      : 'ReserveX API is healthy and running',
    database: dbStatus,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
