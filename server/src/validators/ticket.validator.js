const { z } = require('zod');

const checkInSchema = {
  body: z.object({
    qrToken: z
      .string({ error: 'QR token is required' })
      .min(10, 'QR token must be a valid base64url signed token')
  })
};

module.exports = {
  checkInSchema
};
