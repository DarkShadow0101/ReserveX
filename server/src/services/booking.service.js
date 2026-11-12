const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/booking.model');
const TicketType = require('../models/ticketType.model');
const Event = require('../models/event.model');
const Membership = require('../models/membership.model');
const AppError = require('../utils/errors');

function generateBookingReference() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BK-${timePart}-${randomPart}`;
}

// 1. Create a temporary booking hold with concurrency-safe conditional atomic inventory reservation
async function createBookingHold(userId, { eventId, items }) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId);
  if (!event || event.status !== 'published') {
    throw new AppError('Event not found or not currently open for bookings', 404);
  }

  if (new Date(event.startsAt) <= new Date()) {
    throw new AppError('Cannot book tickets for an event that has already started or ended', 400);
  }

  const holdTtlMinutes = parseInt(process.env.HOLD_TTL_MINUTES, 10) || 10;
  const holdExpiresAt = new Date(Date.now() + holdTtlMinutes * 60 * 1000);

  const session = await mongoose.startSession();
  let createdBooking;

  try {
    await session.withTransaction(async () => {
      const snapshotItems = [];
      let totalAmount = 0;

      for (const item of items) {
        if (!mongoose.Types.ObjectId.isValid(item.ticketTypeId)) {
          throw new AppError('Invalid ticket type ID format', 400);
        }

        // ATOMIC CONDITIONAL UPDATE:
        // Subtract (reservedCount + soldCount) from totalCapacity atomically.
        // Only updates IF available tickets >= requested quantity.
        // If 100 users try to hold the last 2 tickets simultaneously, exactly one succeeds!
        const updatedTier = await TicketType.findOneAndUpdate(
          {
            _id: item.ticketTypeId,
            event: eventId,
            isActive: true,
            $expr: {
              $gte: [
                { $subtract: ['$totalCapacity', { $add: ['$reservedCount', '$soldCount'] }] },
                item.quantity
              ]
            }
          },
          {
            $inc: { reservedCount: item.quantity }
          },
          {
            session,
            returnDocument: 'after'
          }
        );

        if (!updatedTier) {
          // Check why the atomic update failed to give a clear error message
          const tier = await TicketType.findById(item.ticketTypeId).session(session);
          if (!tier || !tier.isActive) {
            throw new AppError('One or more selected ticket tiers are unavailable or inactive', 400);
          }
          const available = Math.max(0, tier.totalCapacity - (tier.reservedCount + tier.soldCount));
          throw new AppError(
            `Insufficient tickets available for "${tier.name}". Requested ${item.quantity}, but only ${available} remaining.`,
            400
          );
        }

        // Check sales window if set on this tier
        const now = new Date();
        if (updatedTier.salesStartsAt && now < updatedTier.salesStartsAt) {
          throw new AppError(`Ticket sales for "${updatedTier.name}" have not started yet`, 400);
        }
        if (updatedTier.salesEndsAt && now > updatedTier.salesEndsAt) {
          throw new AppError(`Ticket sales for "${updatedTier.name}" have already closed`, 400);
        }

        const subtotal = item.quantity * updatedTier.price;
        totalAmount += subtotal;

        snapshotItems.push({
          ticketType: updatedTier._id,
          name: updatedTier.name,
          quantity: item.quantity,
          pricePerUnit: updatedTier.price,
          subtotal
        });
      }

      const bookingReference = generateBookingReference();

      const [booking] = await Booking.create(
        [
          {
            bookingReference,
            user: userId,
            event: eventId,
            items: snapshotItems,
            totalAmount,
            currency: 'INR',
            status: 'PENDING_PAYMENT',
            holdExpiresAt
          }
        ],
        { session }
      );

      createdBooking = booking;
    });
  } finally {
    await session.endSession();
  }

  return createdBooking;
}

// 2. Customer manual cancellation of a pending hold
async function cancelBookingHold(bookingId, userId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking ID', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.user.toString() !== userId.toString()) {
    throw new AppError('Forbidden: You can only cancel your own bookings', 403);
  }

  if (booking.status !== 'PENDING_PAYMENT') {
    throw new AppError(`Cannot cancel a booking with status ${booking.status}`, 400);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Release held capacity back to inventory
      for (const item of booking.items) {
        await TicketType.findByIdAndUpdate(
          item.ticketType,
          {
            $inc: { reservedCount: -item.quantity }
          },
          { session }
        );
      }

      booking.status = 'CANCELLED';
      await booking.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return booking;
}

// 3. Confirm booking (transition PENDING_PAYMENT -> CONFIRMED, reservedCount -> soldCount)
async function confirmBookingPayment(bookingId, paymentId = null) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking ID', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status === 'CONFIRMED') {
    return booking;
  }

  if (booking.status !== 'PENDING_PAYMENT') {
    throw new AppError(`Cannot confirm payment for a booking with status "${booking.status}"`, 400);
  }

  if (booking.holdExpiresAt < new Date()) {
    throw new AppError('Booking hold has expired. The inventory has been released.', 400);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const item of booking.items) {
        await TicketType.findByIdAndUpdate(
          item.ticketType,
          {
            $inc: {
              reservedCount: -item.quantity, // release hold
              soldCount: item.quantity      // convert to permanently sold
            }
          },
          { session }
        );
      }

      booking.status = 'CONFIRMED';
      booking.paymentId = paymentId || `pay_sim_${Date.now()}`;
      await booking.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return booking;
}

// 4. Background cleaner job: Releases inventory holds for expired bookings
async function cleanupExpiredHolds() {
  const expiredBookings = await Booking.find({
    status: 'PENDING_PAYMENT',
    holdExpiresAt: { $lte: new Date() }
  });

  let expiredCount = 0;

  for (const booking of expiredBookings) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of booking.items) {
          await TicketType.findByIdAndUpdate(
            item.ticketType,
            {
              $inc: { reservedCount: -item.quantity }
            },
            { session }
          );
        }

        booking.status = 'EXPIRED';
        await booking.save({ session });
        expiredCount++;
      });
    } catch (err) {
      console.error(`Failed to expire booking ${booking._id}:`, err.message);
    } finally {
      await session.endSession();
    }
  }

  return { expiredCount };
}

// 5. Get details of a single booking
async function getBookingById(bookingId, userId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking ID', 400);
  }

  const booking = await Booking.findById(bookingId)
    .populate('event', 'title startsAt endsAt venue status organization')
    .populate('user', 'fullName email');

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Authorization check: customer who booked it OR organizer of the event
  const isOwner = booking.user._id.toString() === userId.toString();
  if (!isOwner) {
    const membership = await Membership.findOne({
      user: userId,
      organization: booking.event.organization
    });
    if (!membership || !['owner', 'staff'].includes(membership.role)) {
      throw new AppError('Forbidden: You do not have permission to view this booking', 403);
    }
  }

  return booking;
}

// 6. Get my bookings (Customer)
async function getMyBookings(userId, { page = 1, limit = 20 } = {}) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const [bookings, total] = await Promise.all([
    Booking.find({ user: userId })
      .populate('event', 'title startsAt endsAt venue status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Booking.countDocuments({ user: userId })
  ]);

  return {
    bookings,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
}

// 7. Get all bookings for an event (Organizer)
async function getEventBookings(eventId, userId, { page = 1, limit = 20, status } = {}) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const membership = await Membership.findOne({
    user: userId,
    organization: event.organization
  });
  if (!membership || !['owner', 'staff'].includes(membership.role)) {
    throw new AppError('Forbidden: You do not have permission to view event bookings', 403);
  }

  const filter = { event: eventId };
  if (status) {
    filter.status = status;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Booking.countDocuments(filter)
  ]);

  return {
    bookings,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
}

module.exports = {
  createBookingHold,
  cancelBookingHold,
  confirmBookingPayment,
  cleanupExpiredHolds,
  getBookingById,
  getMyBookings,
  getEventBookings
};
