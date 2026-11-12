const { z } = require('zod');

const createBookingSchema = {
  body: z.object({
    eventId: z
      .string({ error: 'Event ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format'),

    items: z
      .array(
        z.object({
          ticketTypeId: z
            .string({ error: 'Ticket type ID is required' })
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ticket type ID format'),

          quantity: z
            .number({ error: 'Ticket quantity is required' })
            .int('Quantity must be an integer')
            .min(1, 'Quantity must be at least 1')
            .max(10, 'Cannot book more than 10 tickets per order')
        }),
        { error: 'Ticket items are required' }
      )
      .min(1, 'At least one ticket item is required')
  })
};

module.exports = {
  createBookingSchema
};
