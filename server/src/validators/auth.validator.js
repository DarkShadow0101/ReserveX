// src/validators/auth.validator.js
// Exports auth validation schemas (maps to src/schemas/auth.schema.js)

const { registerSchema, loginSchema } = require('../schemas/auth.schema');

module.exports = {
  registerSchema,
  loginSchema
};
