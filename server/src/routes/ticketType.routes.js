const express = require('express');
const router = express.Router();

const ticketTypeController = require('../controllers/ticketType.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateTicketTypeSchema } = require('../validators/ticketType.validator');

// All direct ticket-type mutation routes require authentication
router.use(authMiddleware);

// PATCH /api/ticket-types/:id — Update ticket tier details
router.patch('/:id', validate(updateTicketTypeSchema), ticketTypeController.updateTicketType);

// PATCH /api/ticket-types/:id/toggle — Toggle active/inactive status
router.patch('/:id/toggle', ticketTypeController.toggleTicketTypeStatus);

module.exports = router;
