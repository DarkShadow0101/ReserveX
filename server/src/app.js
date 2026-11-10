const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS for frontend requests
app.use(cors());

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
    res.send('ReserveX API is running');
});

// Health check route
app.use('/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

module.exports = app;
