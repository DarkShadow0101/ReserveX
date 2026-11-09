const express = require('express');
const healthRoutes = require('./routes/health.routes');

const app = express();

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
    res.send('ReserveX API is running');
});

// Health check route
app.use('/health', healthRoutes);

module.exports = app;
