// src/schemas/auth.schema.js
// Zod schemas for validating auth request payloads

const { z } = require('zod');

const registerSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address format')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters long')
      .max(100, 'Full name cannot exceed 100 characters'),
    role: z
      .enum(['ORGANIZER_ADMIN', 'ORGANIZER_STAFF', 'CUSTOMER'], {
        errorMap: () => ({ message: 'Role must be ORGANIZER_ADMIN, ORGANIZER_STAFF, or CUSTOMER' })
      })
      .optional()
  })
};

const loginSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address format')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required')
  })
};

module.exports = {
  registerSchema,
  loginSchema
};
