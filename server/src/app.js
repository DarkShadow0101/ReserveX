const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const organizationRoutes = require('./routes/organization.routes');
const AppError = require('./utils/errors');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS (credentials: true allows cookies to be sent across origins)
app.use(
  cors({
    origin: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);

// Parse incoming JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// Root test route
app.get('/', (req, res) => {
  res.send('ReserveX API is running');
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);

// 404 Catch-All for unknown routes (must come AFTER all valid routes)
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// Central Error Handler (must ALWAYS be the very last middleware in app.js)
app.use(errorHandler);

module.exports = app;
