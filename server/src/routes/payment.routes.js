const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { bookingLimiter } = require('../middleware/rateLimit.middleware');
const validate = require('../middleware/validate.middleware');
const { createOrderSchema, verifyPaymentSchema, demoCompleteSchema } = require('../validators/payment.validator');

// Razorpay Server Webhook (Does NOT use authMiddleware or user rate limits, verified by HMAC-SHA256)
router.post('/webhook', paymentController.handleWebhook);

// Protected Customer Payment Endpoints
router.post(
  '/create-order',
  authMiddleware,
  bookingLimiter,
  validate(createOrderSchema),
  paymentController.createPaymentOrder
);

router.post(
  '/verify',
  authMiddleware,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.post(
  '/demo-complete',
  authMiddleware,
  bookingLimiter,
  validate(demoCompleteSchema),
  paymentController.demoCompletePayment
);

module.exports = router;
