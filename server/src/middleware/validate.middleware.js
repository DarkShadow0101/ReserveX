// src/middleware/validate.middleware.js
// Request validation middleware powered by Zod
//
// Usage example:
// router.post('/register', validate(registerSchema), authController.register);
//
// The schema object can optionally contain:
// - body: z.object({...})
// - query: z.object({...})
// - params: z.object({...})

const { BadRequestError } = require('../utils/errors');

/**
 * Higher-order middleware function that validates the incoming request against a Zod schema
 * @param {import('zod').ZodSchema | { body?: import('zod').ZodSchema, query?: import('zod').ZodSchema, params?: import('zod').ZodSchema }} schema
 */
function validate(schema) {
  return async (req, res, next) => {
    try {
      // Check if schema is a wrapper containing body/query/params keys
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      // If schema itself is a ZodObject without body wrapper, validate req.body directly
      if (!schema.body && !schema.query && !schema.params && typeof schema.parseAsync === 'function') {
        req.body = await schema.parseAsync(req.body);
      }

      return next();
    } catch (err) {
      // If it's a ZodError, format field-level error messages
      if (err.name === 'ZodError') {
        const issues = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        return next(new BadRequestError('Validation failed', issues));
      }

      return next(err);
    }
  };
}

module.exports = validate;
