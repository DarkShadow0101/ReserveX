// src/config/db.js
// Database connection singleton using Prisma Client
//
// Why a singleton?
// In Node.js, creating multiple instances of PrismaClient results in multiple
// database connection pools, which can easily exhaust PostgreSQL connection limits.
// By exporting a single instance, all services reuse the exact same connection pool.

const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient({
  // Log queries in development for debugging, but only warn/error in production
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

module.exports = prisma;
