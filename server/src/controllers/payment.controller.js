const paymentService = require('../services/payment.service');

// POST /api/payments/create-order (Customer)
async function createPaymentOrder(req, res, next) {
  try {
    const order = await paymentService.createPaymentOrder(req.body.bookingId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: { order }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/verify (Customer)
async function verifyPayment(req, res, next) {
  try {
    const result = await paymentService.verifyPayment(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and tickets generated',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/webhook (Razorpay Server-to-Server Webhook)
async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await paymentService.handleRazorpayWebhook(rawBody, signature, req.body);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook
};
