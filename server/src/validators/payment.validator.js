const { z } = require('zod');

const createOrderSchema = {
  body: z.object({
    bookingId: z
      .string({ error: 'Booking ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format')
  })
};

const verifyPaymentSchema = {
  body: z.object({
    bookingId: z
      .string({ error: 'Booking ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format'),

    razorpayOrderId: z
      .string({ error: 'Razorpay order ID is required' })
      .min(1, 'Order ID cannot be empty'),

    razorpayPaymentId: z
      .string({ error: 'Razorpay payment ID is required' })
      .min(1, 'Payment ID cannot be empty'),

    razorpaySignature: z
      .string({ error: 'Razorpay signature is required' })
      .min(1, 'Signature cannot be empty')
  })
};

module.exports = {
  createOrderSchema,
  verifyPaymentSchema
};
