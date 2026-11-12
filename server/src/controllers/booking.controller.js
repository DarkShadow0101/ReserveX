const bookingService = require('../services/booking.service');

// POST /api/bookings (Customer hold creation)
async function createBookingHold(req, res, next) {
  try {
    const booking = await bookingService.createBookingHold(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Booking hold created successfully. Please complete payment before hold expires.',
      data: { booking }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings/:id/cancel (Customer cancellation of hold)
async function cancelBookingHold(req, res, next) {
  try {
    const booking = await bookingService.cancelBookingHold(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Booking hold cancelled successfully and inventory released',
      data: { booking }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/my (Customer's bookings)
async function getMyBookings(req, res, next) {
  try {
    const { bookings, pagination } = await bookingService.getMyBookings(req.user._id, req.query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/:id (Customer or Organizer)
async function getBookingById(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/events/:id/bookings (Organizer view of all event bookings)
async function getEventBookings(req, res, next) {
  try {
    const { bookings, pagination } = await bookingService.getEventBookings(
      req.params.id,
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBookingHold,
  cancelBookingHold,
  getMyBookings,
  getBookingById,
  getEventBookings
};
