const { z } = require('zod');

const createTicketTypeSchema = {
  body: z
    .object({
      name: z
        .string({ error: 'Ticket tier name is required' })
        .trim()
        .min(2, 'Tier name must be at least 2 characters')
        .max(100, 'Tier name cannot exceed 100 characters'),

      description: z.string().trim().optional().default(''),

      price: z
        .number({ error: 'Price in paise is required' })
        .int('Price must be an integer in paise')
        .min(0, 'Price cannot be negative'),

      totalCapacity: z
        .number({ error: 'Total capacity is required' })
        .int('Total capacity must be an integer')
        .min(1, 'Total capacity must be at least 1 ticket'),

      salesStartsAt: z
        .string()
        .datetime({ message: 'salesStartsAt must be a valid ISO date string' })
        .optional(),

      salesEndsAt: z
        .string()
        .datetime({ message: 'salesEndsAt must be a valid ISO date string' })
        .optional()
    })
    .refine(
      (data) => {
        if (data.salesStartsAt && data.salesEndsAt) {
          return new Date(data.salesEndsAt) > new Date(data.salesStartsAt);
        }
        return true;
      },
      {
        message: 'salesEndsAt must be after salesStartsAt',
        path: ['salesEndsAt']
      }
    )
};

const updateTicketTypeSchema = {
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, 'Tier name must be at least 2 characters')
        .max(100, 'Tier name cannot exceed 100 characters')
        .optional(),

      description: z.string().trim().optional(),

      price: z
        .number()
        .int('Price must be an integer in paise')
        .min(0, 'Price cannot be negative')
        .optional(),

      totalCapacity: z
        .number()
        .int('Total capacity must be an integer')
        .min(1, 'Total capacity must be at least 1 ticket')
        .optional(),

      salesStartsAt: z
        .string()
        .datetime({ message: 'salesStartsAt must be a valid ISO date string' })
        .optional(),

      salesEndsAt: z
        .string()
        .datetime({ message: 'salesEndsAt must be a valid ISO date string' })
        .optional()
    })
    .refine(
      (data) => {
        if (data.salesStartsAt && data.salesEndsAt) {
          return new Date(data.salesEndsAt) > new Date(data.salesStartsAt);
        }
        return true;
      },
      {
        message: 'salesEndsAt must be after salesStartsAt',
        path: ['salesEndsAt']
      }
    )
};

module.exports = {
  createTicketTypeSchema,
  updateTicketTypeSchema
};
