// src/server.js
// Server entry point - binds Express application to the HTTP port

const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');

const server = app.listen(env.PORT, () => {
  console.log(`🚀 ReserveX Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  console.log(`👉 Health check available at: http://localhost:${env.PORT}/health`);
});

// Graceful shutdown handling
// When Docker or the host system stops the process, close connections cleanly
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('Prisma database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error disconnecting database during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if connections hang
  setTimeout(() => {
    console.error('Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
