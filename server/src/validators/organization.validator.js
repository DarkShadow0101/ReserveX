const { z } = require('zod');

const createOrgSchema = {
  body: z.object({
    name: z
      .string({ error: 'Organization name is required' })
      .trim()
      .min(2, 'Organization name must be at least 2 characters')
      .max(100, 'Organization name cannot exceed 100 characters'),

    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional()
  })
};

const addMemberSchema = {
  body: z.object({
    email: z
      .string({ error: 'Member email is required' })
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),

    role: z.enum(['owner', 'staff'], {
      error: 'Role must be either owner or staff'
    })
  })
};

module.exports = {
  createOrgSchema,
  addMemberSchema
};
