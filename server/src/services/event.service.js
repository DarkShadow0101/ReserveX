const mongoose = require('mongoose');
const Event = require('../models/event.model');
const Organization = require('../models/organization.model');
const Membership = require('../models/membership.model');
const AppError = require('../utils/errors');

// Helper to verify that an organizer has permission to manage an event
async function verifyEventOrganizerAccess(eventId, userId, allowedRoles = ['owner', 'staff']) {
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

  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new AppError('Forbidden: You do not have permission to manage this event', 403);
  }

  return { event, membership };
}

// 1. Create a draft event under an organization
async function createEvent(orgId, userId, data) {
  const organization = await Organization.findById(orgId);
  if (!organization || !organization.isActive) {
    throw new AppError('Organization not found or inactive', 404);
  }

  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(data.endsAt);

  if (endsAt <= startsAt) {
    throw new AppError('Event end date must be after start date', 400);
  }

  const event = await Event.create({
    organization: orgId,
    title: data.title,
    description: data.description || '',
    venue: data.venue || '',
    startsAt,
    endsAt,
    status: 'draft',
    createdBy: userId
  });

  return event;
}

// 2. List all events under an organization (for organizers)
async function getEventsByOrganization(orgId, query = {}) {
  const filter = { organization: orgId };

  if (query.status) {
    filter.status = query.status;
  }

  const events = await Event.find(filter).sort({ startsAt: 1 });
  return events;
}

// 3. Public event discovery (published events only)
async function getPublicEvents({ search, organizationId, page = 1, limit = 20 } = {}) {
  const filter = { status: 'published' };

  if (organizationId) {
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError('Invalid organization ID', 400);
    }
    filter.organization = organizationId;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { venue: searchRegex },
      { description: searchRegex }
    ];
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('organization', 'name slug')
      .sort({ startsAt: 1 })
      .skip(skip)
      .limit(parsedLimit),
    Event.countDocuments(filter)
  ]);

  return {
    events,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
}

// 4. Public single event details (must be published)
async function getPublicEventById(eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError('Invalid event ID', 400);
  }

  const event = await Event.findOne({
    _id: eventId,
    status: 'published'
  }).populate('organization', 'name slug description');

  if (!event) {
    throw new AppError('Event not found or not published', 404);
  }

  return event;
}

// 5. Organizer event details (draft, published, cancelled)
async function getEventForOrganizer(eventId, userId) {
  const { event, membership } = await verifyEventOrganizerAccess(eventId, userId, ['owner', 'staff']);
  await event.populate('organization', 'name slug description');
  return { event, myRole: membership.role };
}

// 6. Update event details
async function updateEvent(eventId, userId, updateData) {
  const { event } = await verifyEventOrganizerAccess(eventId, userId, ['owner', 'staff']);

  if (event.status === 'cancelled') {
    throw new AppError('Cannot update a cancelled event', 400);
  }
  if (event.status === 'completed') {
    throw new AppError('Cannot update a completed event', 400);
  }

  const newStartsAt = updateData.startsAt ? new Date(updateData.startsAt) : event.startsAt;
  const newEndsAt = updateData.endsAt ? new Date(updateData.endsAt) : event.endsAt;

  if (newEndsAt <= newStartsAt) {
    throw new AppError('Event end date must be after start date', 400);
  }

  if (updateData.title !== undefined) event.title = updateData.title;
  if (updateData.description !== undefined) event.description = updateData.description;
  if (updateData.venue !== undefined) event.venue = updateData.venue;
  if (updateData.startsAt !== undefined) event.startsAt = newStartsAt;
  if (updateData.endsAt !== undefined) event.endsAt = newEndsAt;

  await event.save();
  return event;
}

// 7. Publish event (transitions status from 'draft' to 'published')
async function publishEvent(eventId, userId) {
  const { event } = await verifyEventOrganizerAccess(eventId, userId, ['owner', 'staff']);

  if (event.status === 'published') {
    return event;
  }

  if (event.status === 'cancelled') {
    throw new AppError('Cannot publish a cancelled event', 400);
  }

  event.status = 'published';
  await event.save();
  return event;
}

// 8. Cancel event
async function cancelEvent(eventId, userId) {
  const { event } = await verifyEventOrganizerAccess(eventId, userId, ['owner', 'staff']);

  if (event.status === 'cancelled') {
    return event;
  }

  event.status = 'cancelled';
  await event.save();
  return event;
}

module.exports = {
  createEvent,
  getEventsByOrganization,
  getPublicEvents,
  getPublicEventById,
  getEventForOrganizer,
  updateEvent,
  publishEvent,
  cancelEvent
};
