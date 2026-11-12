const ticketTypeService = require('../services/ticketType.service');

// POST /api/events/:id/ticket-types (Organizer)
async function createTicketType(req, res, next) {
  try {
    const eventId = req.params.id;
    const ticketType = await ticketTypeService.createTicketType(eventId, req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Ticket tier created successfully',
      data: { ticketType }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/events/:id/ticket-types (Public & Organizer)
async function getTicketTypesForEvent(req, res, next) {
  try {
    const eventId = req.params.id;
    // If request has logged-in user, could check if organizer, or pass query flag
    const isOrganizer = req.query.manage === 'true' && !!req.user;
    const ticketTypes = await ticketTypeService.getTicketTypesForEvent(eventId, isOrganizer);

    res.status(200).json({
      success: true,
      data: { ticketTypes }
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/ticket-types/:id (Organizer)
async function updateTicketType(req, res, next) {
  try {
    const ticketType = await ticketTypeService.updateTicketType(req.params.id, req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: 'Ticket tier updated successfully',
      data: { ticketType }
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/ticket-types/:id/toggle (Organizer)
async function toggleTicketTypeStatus(req, res, next) {
  try {
    const ticketType = await ticketTypeService.toggleTicketTypeStatus(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: `Ticket tier ${ticketType.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { ticketType }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTicketType,
  getTicketTypesForEvent,
  updateTicketType,
  toggleTicketTypeStatus
};
