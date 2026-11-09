const express = require('express');
const router = express.Router();
const { getHealth } = require('../controllers/health.controller');

// GET /health
router.get('/', getHealth);

module.exports = router;
