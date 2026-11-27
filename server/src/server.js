require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const { validateEnv } = require('./config/env');
const { startHoldCleanupJob, stopHoldCleanupJob } = require('./jobs/expireHolds.job');

const PORT = process.env.PORT || 5000;
let server;

async function startServer() {
  // 1. Fail fast if critical environment variables are missing
  validateEnv();

  // 2. Connect to MongoDB BEFORE accepting HTTP requests
  await connectDB();

  // 3. Start background job that releases expired 10-minute ticket holds every 60s
  startHoldCleanupJob(60000);

  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

// Graceful shutdown for zero-downtime deploys (Render sends SIGTERM; Ctrl+C sends SIGINT)
async function shutdown(signal) {
  console.log(`\n[shutdown] ${signal} received. Closing server gracefully...`);
  stopHoldCleanupJob();

  const forceExitTimer = setTimeout(() => {
    console.error('[shutdown] Force exiting after 10s drain timeout.');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
    }
    console.log('[shutdown] HTTP server and MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('[shutdown] Error during graceful shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled Promise Rejection:', reason);
  shutdown('unhandledRejection');
});

startServer().catch((err) => {
  console.error('[startup] Failed to start ReserveX server:', err.message);
  process.exit(1);
});
