// src/app.js
// Express application setup
//
// NOTE: We intentionally separate app.js from server.js.
// - app.js: Configures Express middleware, routes, and error handling.
// - server.js: Starts the HTTP server on a port (app.listen).
//
// This allows Supertest tests to import `app` directly and execute requests
// without binding to an actual network port.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { NotFoundError } = require('./utils/errors');

const app = express();

// ----------------------------------------------------
// SECURITY & ESSENTIAL MIDDLEWARE
// ----------------------------------------------------

// Helmet adds secure HTTP headers to guard against common web vulnerabilities
app.use(helmet());

// CORS configures allowed cross-origin requests (e.g. from Vite frontend on port 5173)
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Built-in Express middleware to parse JSON bodies and URL-encoded query/body data
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------
app.use(routes);

// ----------------------------------------------------
// 404 CATCH-ALL HANDLER
// ----------------------------------------------------
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// ----------------------------------------------------
// CENTRAL ERROR HANDLER
// ----------------------------------------------------
app.use(errorHandler);

module.exports = app;
