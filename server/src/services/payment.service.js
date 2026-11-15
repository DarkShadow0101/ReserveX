const crypto = require('crypto');
const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const WebhookEvent = require('../models/webhookEvent.model');
const bookingService = require('./booking.service');
const ticketService = require('./ticket.service');
const { getRazorpayInstance } = require('../config/razorpay');
const AppError = require('../utils/errors');

function getRazorpaySecret() {
  return process.env.RAZORPAY_KEY_SECRET || 'reservex_rzp_secret_local_test';
}

function getWebhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET || 'reservex_webhook_secret_local';
}

// 1. Create a Razorpay Order for an active booking hold
async function createPaymentOrder(bookingId, userId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking ID', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.user.toString() !== userId.toString()) {
    throw new AppError('Forbidden: You can only pay for your own bookings', 403);
  }

  if (booking.status !== 'PENDING_PAYMENT') {
    throw new AppError(`Cannot create payment for booking in status "${booking.status}"`, 400);
  }

  if (booking.holdExpiresAt < new Date()) {
    throw new AppError('Booking hold has expired. Please create a new booking reservation.', 400);
  }

  // Create order with Razorpay
  let order;
  try {
    const razorpay = getRazorpayInstance();
    order = await razorpay.orders.create({
      amount: booking.totalAmount, // in paise
      currency: 'INR',
      receipt: booking.bookingReference,
      notes: {
        bookingId: booking._id.toString()
      }
    });
  } catch (err) {
    // If running in test environment or using test/mock credentials
    if (
      process.env.NODE_ENV === 'test' ||
      !process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID.includes('placeholder') ||
      process.env.RAZORPAY_KEY_ID.includes('local')
    ) {
      order = {
        id: `order_test_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        amount: booking.totalAmount,
        currency: 'INR',
        receipt: booking.bookingReference
      };
    } else {
      throw new AppError(`Payment provider error: ${err.message}`, 502);
    }
  }

  // Record initial Payment entity in CREATED state
  const payment = await Payment.create({
    booking: booking._id,
    user: userId,
    razorpayOrderId: order.id,
    amount: booking.totalAmount,
    currency: 'INR',
    status: 'CREATED'
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    bookingReference: booking.bookingReference,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_reservex_local'
  };
}

// 2. Verify Razorpay Payment Signature and confirm booking + issue digital tickets
async function verifyPayment(userId, { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError('Missing payment verification parameters', 400);
  }

  // HMAC-SHA256 signature verification: hmac(order_id + "|" + payment_id, secret)
  const secret = getRazorpaySecret();
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (razorpaySignature !== expectedSignature) {
    throw new AppError('Invalid payment signature. Transaction could not be verified.', 400);
  }

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      // Find or update payment record
      let payment = await Payment.findOne({ razorpayOrderId }).session(session);
      if (!payment) {
        payment = new Payment({
          booking: bookingId,
          user: userId,
          razorpayOrderId,
          amount: 0,
          currency: 'INR',
          status: 'CAPTURED'
        });
      }

      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'CAPTURED';
      await payment.save({ session });

      // Confirm booking inside transaction (transitions hold count to sold count)
      const confirmedBooking = await bookingService.confirmBookingPayment(
        bookingId,
        razorpayPaymentId,
        session
      );

      // Generate digital tickets with cryptographically signed QR tokens inside transaction
      const tickets = await ticketService.generateTicketsForBooking(confirmedBooking, session);

      result = {
        booking: confirmedBooking,
        payment,
        tickets
      };
    });
  } finally {
    await session.endSession();
  }

  return result;
}

// 3. Idempotent Webhook Handler for Razorpay events
async function handleRazorpayWebhook(rawBody, signature, eventData) {
  if (!signature || !rawBody) {
    throw new AppError('Missing webhook signature or payload', 400);
  }

  // Validate webhook HMAC signature over raw body buffer
  const secret = getWebhookSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  if (signature !== expectedSignature) {
    throw new AppError('Invalid webhook signature', 400);
  }

  const eventId = eventData.event_id || eventData.id || `evt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const eventType = eventData.event;

  // Idempotency check: If already processed, return immediately
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent) {
    return {
      status: 'ignored',
      message: 'Webhook event already processed'
    };
  }

  // Record webhook event in DB
  await WebhookEvent.create({
    eventId,
    eventType,
    payload: eventData,
    status: 'PROCESSED'
  });

  // Handle payment.captured or order.paid
  if (eventType === 'payment.captured' || eventType === 'order.paid') {
    const paymentEntity = eventData.payload && eventData.payload.payment && eventData.payload.payment.entity;
    if (paymentEntity && paymentEntity.order_id) {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'CAPTURED') {
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            payment.status = 'CAPTURED';
            payment.razorpayPaymentId = paymentId;
            await payment.save({ session });

            const booking = await Booking.findById(payment.booking).session(session);
            if (booking && booking.status === 'PENDING_PAYMENT') {
              const confirmedBooking = await bookingService.confirmBookingPayment(booking._id, paymentId, session);
              await ticketService.generateTicketsForBooking(confirmedBooking, session);
            }
          });
        } finally {
          await session.endSession();
        }
      }
    }
  }

  // Handle payment.failed
  if (eventType === 'payment.failed') {
    const paymentEntity = eventData.payload && eventData.payload.payment && eventData.payload.payment.entity;
    if (paymentEntity && paymentEntity.order_id) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: paymentEntity.order_id },
        {
          status: 'FAILED',
          failureReason: paymentEntity.error_description || 'Payment failed at bank gateway'
        }
      );
    }
  }

  return {
    status: 'processed',
    eventType
  };
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook
};
