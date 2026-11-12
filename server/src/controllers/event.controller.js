const eventService = require('../services/event.service');

// POST /api/organizations/:id/events (Organizer)
async function createEvent(req, res, next) {
  try {
    const orgId = req.params.id;
    const event = await eventService.createEvent(orgId, req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/organizations/:id/events (Organizer)
async function getOrganizationEvents(req, res, next) {
  try {
    const orgId = req.params.id;
    const events = await eventService.getEventsByOrganization(orgId, req.query);

    res.status(200).json({
      success: true,
      data: { events }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/events (Public)
async function getPublicEvents(req, res, next) {
  try {
    const { events, pagination } = await eventService.getPublicEvents(req.query);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/events/:id (Public)
async function getPublicEventById(req, res, next) {
  try {
    const event = await eventService.getPublicEventById(req.params.id);

    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/events/:id/manage (Organizer details with draft/cancelled status)
async function getEventDetailsForOrganizer(req, res, next) {
  try {
    const { event, myRole } = await eventService.getEventForOrganizer(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      data: { event, myRole }
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/events/:id (Organizer)
async function updateEvent(req, res, next) {
  try {
    const event = await eventService.updateEvent(req.params.id, req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/events/:id/publish (Organizer)
async function publishEvent(req, res, next) {
  try {
    const event = await eventService.publishEvent(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Event published successfully',
      data: { event }
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/events/:id/cancel (Organizer)
async function cancelEvent(req, res, next) {
  try {
    const event = await eventService.cancelEvent(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      data: { event }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEvent,
  getOrganizationEvents,
  getPublicEvents,
  getPublicEventById,
  getEventDetailsForOrganizer,
  updateEvent,
  publishEvent,
  cancelEvent
};
