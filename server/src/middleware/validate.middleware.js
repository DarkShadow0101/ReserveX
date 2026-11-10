// Reusable Zod validation middleware
// Usage in routes: router.post('/register', validate(registerSchema), controller.RegisterUser)
function validate(schema) {
  // Returns an Express middleware tailored to the specific schema passed in
  return async (req, res, next) => {
    try {
      if (schema.body) {
        // parseAsync validates AND cleans data (like .trim() / .toLowerCase())
        req.body = await schema.body.parseAsync(req.body || {});
      }

      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params || {});
      }

      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query || {});
      }

      next();
    } catch (err) {
      // If Zod throws a ZodError, errorHandler automatically turns it into a 400 JSON response!
      next(err);
    }
  };
}

module.exports = validate;
