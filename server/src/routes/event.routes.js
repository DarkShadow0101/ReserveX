const express = require('express');
const router = express.Router();

const eventController = require('../controllers/event.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateEventSchema } = require('../validators/event.validator');

// --- Public Event Discovery Routes ---
// GET /api/events — List all published events (supports ?search=&organizationId=&page=&limit=)
router.get('/', eventController.getPublicEvents);

// --- Organizer Event Management Routes ---
// GET /api/events/:id/manage — Fetch event details for organizers (even drafts/cancelled)
router.get('/:id/manage', authMiddleware, eventController.getEventDetailsForOrganizer);

// PATCH /api/events/:id — Update event info (owner or staff only)
router.patch('/:id', authMiddleware, validate(updateEventSchema), eventController.updateEvent);

// PATCH /api/events/:id/publish — Publish event (owner or staff only)
router.patch('/:id/publish', authMiddleware, eventController.publishEvent);

// PATCH /api/events/:id/cancel — Cancel event (owner or staff only)
router.patch('/:id/cancel', authMiddleware, eventController.cancelEvent);

// --- Public Single Event Detail Route ---
// GET /api/events/:id — Fetch single public event (must be published)
router.get('/:id', eventController.getPublicEventById);

module.exports = router;
