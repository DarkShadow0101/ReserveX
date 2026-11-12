const { z } = require('zod');

const createEventSchema = {
  body: z
    .object({
      title: z
        .string({ error: 'Event title is required' })
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(150, 'Title cannot exceed 150 characters'),

      description: z.string().trim().optional().default(''),
      venue: z.string().trim().optional().default(''),

      startsAt: z
        .string({ error: 'Event start date/time is required' })
        .datetime({ message: 'startsAt must be a valid ISO date string (e.g. 2026-12-01T10:00:00.000Z)' }),

      endsAt: z
        .string({ error: 'Event end date/time is required' })
        .datetime({ message: 'endsAt must be a valid ISO date string (e.g. 2026-12-01T18:00:00.000Z)' })
    })
    .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
      message: 'endsAt must be after startsAt',
      path: ['endsAt']
    })
};

const updateEventSchema = {
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(150, 'Title cannot exceed 150 characters')
        .optional(),

      description: z.string().trim().optional(),
      venue: z.string().trim().optional(),

      startsAt: z
        .string()
        .datetime({ message: 'startsAt must be a valid ISO date string' })
        .optional(),

      endsAt: z
        .string()
        .datetime({ message: 'endsAt must be a valid ISO date string' })
        .optional()
    })
    .refine(
      (data) => {
        if (data.startsAt && data.endsAt) {
          return new Date(data.endsAt) > new Date(data.startsAt);
        }
        return true;
      },
      {
        message: 'endsAt must be after startsAt',
        path: ['endsAt']
      }
    )
};

module.exports = {
  createEventSchema,
  updateEventSchema
};
