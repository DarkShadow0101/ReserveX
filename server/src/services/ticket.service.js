const crypto = require('crypto');
const mongoose = require('mongoose');
const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const Membership = require('../models/membership.model');
const AppError = require('../utils/errors');

function getQrSecret() {
  return process.env.QR_SIGNING_SECRET || 'reservex-secret-qr-key-min-32-chars';
}

// Generates an HMAC-SHA256 cryptographically signed QR token
function generateSignedQrToken(ticketNumber, eventId, bookingId) {
  const payload = {
    ticketNumber,
    eventId: eventId.toString(),
    bookingId: bookingId.toString(),
    issuedAt: Date.now()
  };

  const secret = getQrSecret();
  const serialized = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(serialized).digest('hex');

  const envelope = {
    payload,
    sig
  };

  return Buffer.from(JSON.stringify(envelope)).toString('base64url');
}

// Verifies the HMAC-SHA256 signature of a scanned QR token
function verifyQrToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      throw new AppError('QR token is required', 400);
    }

    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const { payload, sig } = JSON.parse(raw);

    if (!payload || !sig || !payload.ticketNumber) {
      throw new AppError('Malformed QR token structure', 400);
    }

    const secret = getQrSecret();
    const expectedSig = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

    if (sig !== expectedSig) {
      throw new AppError('Forged or invalid ticket QR signature', 400);
    }

    return payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid or corrupted QR token', 400);
  }
}

// 1. Generate tickets for a confirmed booking
async function generateTicketsForBooking(booking, session = null) {
  const customerId = booking.user._id || booking.user;
  const user = await User.findById(customerId);

  const customerName = user ? user.fullName : 'Valued Attendee';
  const customerEmail = user ? user.email : 'attendee@reservex.local';

  const ticketsToCreate = [];
  let ticketIndex = 1;

  for (const item of booking.items) {
    for (let i = 0; i < item.quantity; i++) {
      const ticketNumber = `TKT-${booking.bookingReference}-${ticketIndex.toString().padStart(2, '0')}`;
      const qrToken = generateSignedQrToken(ticketNumber, booking.event, booking._id);

      ticketsToCreate.push({
        ticketNumber,
        booking: booking._id,
        event: booking.event,
        ticketType: item.ticketType,
        tierName: item.name,
        customer: customerId,
        customerName,
        customerEmail,
        qrToken,
        status: 'VALID'
      });

      ticketIndex++;
    }
  }

  const options = session ? { session, ordered: true } : {};
  const createdTickets = await Ticket.create(ticketsToCreate, options);
  return createdTickets;
}

// 2. Check-in validation endpoint (Staff/Owner scans QR token, enforces single-use)
async function checkInTicket(qrToken, scannerUserId) {
  // Verify token cryptographic signature
  const payload = verifyQrToken(qrToken);

  const ticket = await Ticket.findOne({ ticketNumber: payload.ticketNumber })
    .populate('event', 'title startsAt endsAt venue organization');

  if (!ticket) {
    throw new AppError('Ticket not found in system', 404);
  }

  // Verify scanner has owner or staff role in the event's parent organization
  const membership = await Membership.findOne({
    user: scannerUserId,
    organization: ticket.event.organization
  });

  if (!membership || !['owner', 'staff'].includes(membership.role)) {
    throw new AppError('Forbidden: You are not authorized to check in tickets for this event', 403);
  }

  // Single-use enforcement
  if (ticket.status === 'USED') {
    throw new AppError(
      `Ticket has ALREADY been used (Checked in at ${ticket.usedAt.toISOString()})`,
      409
    );
  }

  if (ticket.status === 'CANCELLED') {
    throw new AppError('This ticket was cancelled and cannot be used for entry', 400);
  }

  ticket.status = 'USED';
  ticket.usedAt = new Date();
  ticket.checkedInBy = scannerUserId;
  await ticket.save();

  return ticket;
}

// 3. Customer retrieves their own tickets
async function getMyTickets(userId, { eventId } = {}) {
  const filter = { customer: userId };
  if (eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new AppError('Invalid event ID', 400);
    }
    filter.event = eventId;
  }

  const tickets = await Ticket.find(filter)
    .populate('event', 'title startsAt endsAt venue status')
    .sort({ createdAt: -1 });

  return tickets;
}

// 4. Retrieve single ticket detail
async function getTicketById(ticketId, userId) {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new AppError('Invalid ticket ID', 400);
  }

  const ticket = await Ticket.findById(ticketId)
    .populate('event', 'title startsAt endsAt venue status organization');

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  const isCustomer = ticket.customer.toString() === userId.toString();
  if (!isCustomer) {
    const membership = await Membership.findOne({
      user: userId,
      organization: ticket.event.organization
    });
    if (!membership || !['owner', 'staff'].includes(membership.role)) {
      throw new AppError('Forbidden: You do not have permission to view this ticket', 403);
    }
  }

  return ticket;
}

// 5. Organizer lists all tickets for an event
async function getEventTickets(eventId, userId, { status, page = 1, limit = 50 } = {}) {
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
    throw new AppError('Forbidden: You do not have permission to view event tickets', 403);
  }

  const filter = { event: eventId };
  if (status) {
    filter.status = status;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const skip = (parsedPage - 1) * parsedLimit;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('customer', 'fullName email')
      .populate('checkedInBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Ticket.countDocuments(filter)
  ]);

  return {
    tickets,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
}

module.exports = {
  generateSignedQrToken,
  verifyQrToken,
  generateTicketsForBooking,
  checkInTicket,
  getMyTickets,
  getTicketById,
  getEventTickets
};
