const ticketService = require('../services/ticket.service');

// GET /api/tickets/my (Customer)
async function getMyTickets(req, res, next) {
  try {
    const tickets = await ticketService.getMyTickets(req.user._id, req.query);

    res.status(200).json({
      success: true,
      data: { tickets }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/tickets/:id (Customer or Organizer)
async function getTicketById(req, res, next) {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      data: { ticket }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/tickets/checkin (Organizer staff/owner scans QR token)
async function checkInTicket(req, res, next) {
  try {
    const ticket = await ticketService.checkInTicket(req.body.qrToken, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Ticket checked in successfully',
      data: { ticket }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/events/:id/tickets (Organizer lists all event tickets)
async function getEventTickets(req, res, next) {
  try {
    const { tickets, pagination } = await ticketService.getEventTickets(
      req.params.id,
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyTickets,
  getTicketById,
  checkInTicket,
  getEventTickets
};
