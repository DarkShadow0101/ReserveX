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

  // Create order with Razorpay (with sandbox fallback strictly in non-production environments)
  let order;
  let isDemoFallback = false;
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const isProd = process.env.NODE_ENV === 'production';

  try {
    if (!isProd && (process.env.PAYMENT_MODE === 'demo' || !keyId || keyId.includes('placeholder') || keyId.includes('local'))) {
      throw new Error('Using sandbox order simulator');
    }
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
    if (!isProd) {
      isDemoFallback = true;
      order = {
        id: `order_test_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        amount: booking.totalAmount,
        currency: 'INR',
        receipt: booking.bookingReference
      };
    } else {
      const providerMsg = err?.error?.description || err?.description || err?.message || 'Gateway unavailable';
      throw new AppError(`Payment provider error: ${providerMsg}`, 502);
    }
  }

  // Record initial Payment entity in CREATED state
  await Payment.create({
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
    keyId: keyId || 'rzp_test_reservex_local',
    isDemoFallback
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
      // Find trusted payment record created during createPaymentOrder
      const payment = await Payment.findOne({ razorpayOrderId }).session(session);

      if (!payment) {
        throw new AppError('Payment order not found or untrusted. Please initiate payment through checkout.', 404);
      }

      if (payment.user.toString() !== userId.toString()) {
        throw new AppError('Forbidden: This payment order does not belong to you', 403);
      }

      if (bookingId && payment.booking.toString() !== bookingId.toString()) {
        throw new AppError('Payment order does not match the provided booking reservation', 400);
      }

      // If already captured (idempotent retry or concurrent webhook), return existing booking & tickets
      if (payment.status === 'CAPTURED') {
        const confirmedBooking = await Booking.findById(payment.booking).session(session);
        const tickets = await ticketService.getTicketsForBooking(payment.booking, session);
        result = {
          booking: confirmedBooking,
          payment,
          tickets
        };
        return;
      }

      if (payment.status !== 'CREATED') {
        throw new AppError(`Cannot verify payment in status "${payment.status}"`, 400);
      }

      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'CAPTURED';
      await payment.save({ session });

      // Confirm booking inside transaction (transitions hold count to sold count)
      const confirmedBooking = await bookingService.confirmBookingPayment(
        payment.booking,
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
  } catch (err) {
    // Handle concurrent MongoDB WriteConflict / TransientTransactionError when webhook captured simultaneously
    const isTransientConflict =
      err.code === 112 ||
      err.code === 11000 ||
      (typeof err.hasErrorLabel === 'function' && err.hasErrorLabel('TransientTransactionError'));

    if (isTransientConflict) {
      console.warn(
        `[verifyPayment] Concurrent transaction conflict for order ${razorpayOrderId} (code=${err.code}); checking final state.`
      );
      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment && payment.user.toString() === userId.toString() && payment.status === 'CAPTURED') {
        const confirmedBooking = await Booking.findById(payment.booking);
        if (confirmedBooking && confirmedBooking.status === 'CONFIRMED') {
          const tickets = await ticketService.getTicketsForBooking(payment.booking);
          return {
            booking: confirmedBooking,
            payment,
            tickets
          };
        }
      }
    }

    console.error(
      `[verifyPayment] Error for order=${razorpayOrderId} booking=${bookingId}: ${err.name} (${err.code || err.statusCode || 500}) ${err.message}`
    );
    throw err;
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

  // Concurrent delivery guard & deduplication:
  // Register the webhook event initially with status 'PROCESSING'
  let webhookDoc;
  try {
    webhookDoc = await WebhookEvent.create({
      eventId,
      eventType,
      payload: eventData,
      status: 'PROCESSING',
      attempts: 1
    });
  } catch (err) {
    if (err.code === 11000) {
      // Record already exists for this eventId
      const existing = await WebhookEvent.findOne({ eventId });
      if (!existing) throw err;

      if (existing.status === 'PROCESSED') {
        return {
          status: 'ignored',
          message: 'Webhook event already processed'
        };
      }

      if (existing.status === 'PROCESSING') {
        return {
          status: 'ignored',
          message: 'Webhook event is currently being processed'
        };
      }

      if (existing.status === 'FAILED') {
        // Previous attempt failed; atomically claim it for retry
        const claimed = await WebhookEvent.findOneAndUpdate(
          { eventId, status: 'FAILED' },
          {
            $set: { status: 'PROCESSING', errorMessage: null },
            $inc: { attempts: 1 }
          },
          { returnDocument: 'after' }
        );

        if (!claimed) {
          // Another concurrent worker claimed the retry
          return {
            status: 'ignored',
            message: 'Webhook event is currently being processed'
          };
        }
        webhookDoc = claimed;
      } else {
        return {
          status: 'ignored',
          message: `Webhook event in status "${existing.status}"`
        };
      }
    } else {
      throw err;
    }
  }

  // Execute business operations with error trapping
  try {
    // Handle payment.captured or order.paid
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = eventData.payload && eventData.payload.payment && eventData.payload.payment.entity;
      if (paymentEntity && paymentEntity.order_id) {
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;

        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            const payment = await Payment.findOne({ razorpayOrderId: orderId }).session(session);
            if (!payment || payment.status === 'CAPTURED') {
              return;
            }

            payment.status = 'CAPTURED';
            payment.razorpayPaymentId = paymentId;
            await payment.save({ session });

            const booking = await Booking.findById(payment.booking).session(session);
            if (booking && booking.status === 'PENDING_PAYMENT') {
              const confirmedBooking = await bookingService.confirmBookingPayment(booking._id, paymentId, session);
              await ticketService.generateTicketsForBooking(confirmedBooking, session);
            }
          });
        } catch (txErr) {
          // If verifyPayment committed concurrently and caused a transient conflict, check if already captured
          const isTransientConflict =
            txErr.code === 112 ||
            txErr.code === 11000 ||
            (typeof txErr.hasErrorLabel === 'function' && txErr.hasErrorLabel('TransientTransactionError'));

          if (isTransientConflict) {
            const settled = await Payment.findOne({ razorpayOrderId: orderId });
            if (settled && settled.status === 'CAPTURED') {
              console.warn(`[webhook] Concurrent capture already completed for order ${orderId}`);
            } else {
              throw txErr;
            }
          } else {
            throw txErr;
          }
        } finally {
          await session.endSession();
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

    // Mark event as PROCESSED only after business operations succeed
    await WebhookEvent.findByIdAndUpdate(webhookDoc._id, {
      status: 'PROCESSED',
      processedAt: new Date(),
      errorMessage: null
    });

    return {
      status: 'processed',
      eventType
    };
  } catch (error) {
    // Record failure in WebhookEvent so gateway retries can be safely reprocessed
    await WebhookEvent.findByIdAndUpdate(webhookDoc._id, {
      status: 'FAILED',
      errorMessage: error.message
    });
    throw error;
  }
}

/**
 * Non-production sandbox confirmation for `order_test_` orders when live Razorpay keys
 * are inactive/unconfigured locally. Strictly disabled in production.
 */
async function completeDemoPayment(userId, { bookingId, razorpayOrderId }) {
  if (process.env.NODE_ENV === 'production') {
    throw new AppError('Demo payment simulation is disabled in production', 403);
  }

  if (!razorpayOrderId || !razorpayOrderId.startsWith('order_test_')) {
    throw new AppError('Only local sandbox orders (order_test_*) can use demo confirmation', 400);
  }

  const razorpayPaymentId = `pay_demo_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const razorpaySignature = crypto
    .createHmac('sha256', getRazorpaySecret())
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return verifyPayment(userId, {
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  completeDemoPayment,
  handleRazorpayWebhook
};
