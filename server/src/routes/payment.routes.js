const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createOrderSchema, verifyPaymentSchema } = require('../validators/payment.validator');

// Razorpay Server Webhook (Does NOT use authMiddleware, verified by HMAC-SHA256 signature)
router.post('/webhook', paymentController.handleWebhook);

// Protected Customer Payment Endpoints
router.post(
  '/create-order',
  authMiddleware,
  validate(createOrderSchema),
  paymentController.createPaymentOrder
);

router.post(
  '/verify',
  authMiddleware,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

module.exports = router;
