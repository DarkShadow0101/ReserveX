const express = require('express');
const router = express.Router();

const ticketController = require('../controllers/ticket.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { checkInSchema } = require('../validators/ticket.validator');

// All ticket endpoints require authentication
router.use(authMiddleware);

// GET /api/tickets/my — List current user's tickets
// NOTE: /my MUST be mounted before /:id to prevent treating "my" as an :id parameter
router.get('/my', ticketController.getMyTickets);

// POST /api/tickets/checkin — Staff/Owner scans QR token and checks in attendee
router.post('/checkin', validate(checkInSchema), ticketController.checkInTicket);

// GET /api/tickets/:id — View single ticket with QR code data
router.get('/:id', ticketController.getTicketById);

module.exports = router;
