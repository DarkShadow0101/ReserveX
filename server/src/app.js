const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const organizationRoutes = require('./routes/organization.routes');
const eventRoutes = require('./routes/event.routes');
const ticketTypeRoutes = require('./routes/ticketType.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const ticketRoutes = require('./routes/ticket.routes');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const AppError = require('./utils/errors');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Trust the first reverse proxy hop (Render, Vercel, Nginx) so rate-limiters see real client IPs
app.set('trust proxy', 1);

// Hide Express stack fingerprint and apply secure HTTP response headers
app.disable('x-powered-by');
app.use(helmet());

// Parse comma-separated allowed CORS origins (normalizing trailing slashes)
const rawOrigins = process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow non-browser / server-to-server calls (webhooks, UptimeRobot, curl)
      if (!requestOrigin) {
        return callback(null, true);
      }
      const normalized = requestOrigin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      return callback(new AppError('Origin not allowed by CORS', 403));
    },
    credentials: true
  })
);

// Parse JSON with explicit size ceiling and capture rawBuffer for Razorpay webhook HMAC verification
app.use(
  express.json({
    limit: '100kb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(cookieParser());

// Apply baseline API rate limiting across all /api routes (skips webhooks & test environment)
app.use('/api', apiLimiter);

// Root status check
app.get('/', (req, res) => {
  res.send('ReserveX API is running');
});

// Feature Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);

// 404 Catch-All for unknown routes (must come AFTER all valid routes)
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// Central Error Handler (must ALWAYS be the very last middleware in app.js)
app.use(errorHandler);

module.exports = app;
