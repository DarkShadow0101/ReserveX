const express = require('express');

const app = express();

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
    res.send('ReserveX API is running');
});

module.exports = app;
