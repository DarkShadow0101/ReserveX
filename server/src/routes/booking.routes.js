const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createBookingSchema } = require('../validators/booking.validator');

// All booking operations require an authenticated user
router.use(authMiddleware);

// POST /api/bookings — Reserve temporary booking hold
router.post('/', validate(createBookingSchema), bookingController.createBookingHold);

// GET /api/bookings/my — List current user's bookings
// NOTE: /my MUST be mounted before /:id to avoid treating "my" as an :id parameter
router.get('/my', bookingController.getMyBookings);

// GET /api/bookings/:id — Get details of a single booking
router.get('/:id', bookingController.getBookingById);

// POST /api/bookings/:id/cancel — Cancel hold and release reserved tickets
router.post('/:id/cancel', bookingController.cancelBookingHold);

module.exports = router;
