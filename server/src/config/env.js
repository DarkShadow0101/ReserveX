// src/config/env.js
// Loads and validates environment variables from .env file

const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env file from the server root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

// Fail fast in production if required secrets are missing
if (env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    throw new Error('FATAL: DATABASE_URL is required in production environment.');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET is required in production environment.');
  }
}

module.exports = env;
