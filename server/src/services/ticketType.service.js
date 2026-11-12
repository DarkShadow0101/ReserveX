const mongoose = require('mongoose');
const TicketType = require('../models/ticketType.model');
const Event = require('../models/event.model');
const Membership = require('../models/membership.model');
const AppError = require('../utils/errors');

// Helper to verify that the requesting user is an owner or staff of the event's organization
async function verifyEventOrganizerAccess(eventId, userId) {
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
    throw new AppError('Forbidden: You do not have permission to manage this event', 403);
  }

  return { event, membership };
}

// Helper to verify organizer access directly from a ticketTypeId
async function verifyTicketTypeOrganizerAccess(ticketTypeId, userId) {
  if (!mongoose.Types.ObjectId.isValid(ticketTypeId)) {
    throw new AppError('Invalid ticket type ID', 400);
  }

  const ticketType = await TicketType.findById(ticketTypeId);
  if (!ticketType) {
    throw new AppError('Ticket tier not found', 404);
  }

  const { event, membership } = await verifyEventOrganizerAccess(ticketType.event, userId);
  return { ticketType, event, membership };
}

// 1. Create a ticket tier for an event
async function createTicketType(eventId, userId, data) {
  const { event } = await verifyEventOrganizerAccess(eventId, userId);

  if (event.status === 'cancelled') {
    throw new AppError('Cannot add ticket tiers to a cancelled event', 400);
  }
  if (event.status === 'completed') {
    throw new AppError('Cannot add ticket tiers to a completed event', 400);
  }

  const ticketType = await TicketType.create({
    event: eventId,
    name: data.name,
    description: data.description || '',
    price: data.price,
    totalCapacity: data.totalCapacity,
    salesStartsAt: data.salesStartsAt ? new Date(data.salesStartsAt) : undefined,
    salesEndsAt: data.salesEndsAt ? new Date(data.salesEndsAt) : undefined,
    isActive: true
  });

  return ticketType;
}

// 2. Get ticket types for an event
async function getTicketTypesForEvent(eventId, isOrganizer = false) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError('Invalid event ID', 400);
  }

  const filter = { event: eventId };

  if (!isOrganizer) {
    const event = await Event.findOne({ _id: eventId, status: 'published' });
    if (!event) {
      throw new AppError('Event not found or not published', 404);
    }
    filter.isActive = true;
  }

  const ticketTypes = await TicketType.find(filter).sort({ price: 1, createdAt: 1 });
  return ticketTypes;
}

// 3. Update a ticket tier (with capacity guardrail)
async function updateTicketType(ticketTypeId, userId, updateData) {
  const { ticketType } = await verifyTicketTypeOrganizerAccess(ticketTypeId, userId);

  // Critical safety guard: Cannot reduce capacity below tickets already reserved or sold
  if (updateData.totalCapacity !== undefined) {
    const committedCount = ticketType.reservedCount + ticketType.soldCount;
    if (updateData.totalCapacity < committedCount) {
      throw new AppError(
        `Cannot reduce total capacity to ${updateData.totalCapacity}. There are already ${committedCount} tickets committed (${ticketType.reservedCount} reserved, ${ticketType.soldCount} sold).`,
        400
      );
    }
    ticketType.totalCapacity = updateData.totalCapacity;
  }

  if (updateData.name !== undefined) ticketType.name = updateData.name;
  if (updateData.description !== undefined) ticketType.description = updateData.description;
  if (updateData.price !== undefined) ticketType.price = updateData.price;
  if (updateData.salesStartsAt !== undefined) {
    ticketType.salesStartsAt = updateData.salesStartsAt ? new Date(updateData.salesStartsAt) : undefined;
  }
  if (updateData.salesEndsAt !== undefined) {
    ticketType.salesEndsAt = updateData.salesEndsAt ? new Date(updateData.salesEndsAt) : undefined;
  }

  await ticketType.save();
  return ticketType;
}

// 4. Toggle active/inactive status of a ticket tier
async function toggleTicketTypeStatus(ticketTypeId, userId) {
  const { ticketType } = await verifyTicketTypeOrganizerAccess(ticketTypeId, userId);

  ticketType.isActive = !ticketType.isActive;
  await ticketType.save();

  return ticketType;
}

module.exports = {
  createTicketType,
  getTicketTypesForEvent,
  updateTicketType,
  toggleTicketTypeStatus
};
