const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const crypto = require('crypto');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Organization = require('../src/models/organization.model');
const Membership = require('../src/models/membership.model');
const Event = require('../src/models/event.model');
const TicketType = require('../src/models/ticketType.model');
const Booking = require('../src/models/booking.model');
const Payment = require('../src/models/payment.model');
const Ticket = require('../src/models/ticket.model');
const WebhookEvent = require('../src/models/webhookEvent.model');
const ticketService = require('../src/services/ticket.service');

jest.setTimeout(35000);

describe('Payments & Razorpay Integration API (/api/payments)', () => {
  const uniqueSuffix = Date.now();

  let organizer;
  let customer;
  let outsider;
  let orgId;
  let eventId;
  let ticketTier;
  let bookingId;
  let orderId;

  const createdUserIds = [];
  const createdOrgIds = [];
  const createdEventIds = [];
  const createdTierIds = [];
  const createdBookingIds = [];

  function generateValidPaymentSignature(orderId, paymentId) {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'reservex_rzp_secret_local_test';
    return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  }

  function generateWebhookSignature(payloadString) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'reservex_webhook_secret_local';
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  async function registerTestUser(name, prefix) {
    const res = await request(app).post('/api/auth/register').send({
      fullName: name,
      email: `${prefix}-${uniqueSuffix}@reservex.local`,
      password: 'StrongPassword123'
    });
    createdUserIds.push(res.body.user.id);
    return {
      user: res.body.user,
      token: res.body.token
    };
  }

  beforeAll(async () => {
    await connectDB();

    organizer = await registerTestUser('Fest Organizer', 'pay-org');
    customer = await registerTestUser('Customer Pay', 'pay-cust');
    outsider = await registerTestUser('Outsider User', 'pay-out');

    // Create org
    const orgRes = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({ name: `Pay Fest Org ${uniqueSuffix}` });
    orgId = orgRes.body.data.organization._id;
    createdOrgIds.push(orgId);

    // Create & publish event
    const eventRes = await request(app)
      .post(`/api/organizations/${orgId}/events`)
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({
        title: `Payment Test Fest ${uniqueSuffix}`,
        startsAt: '2026-12-28T10:00:00.000Z',
        endsAt: '2026-12-28T18:00:00.000Z'
      });
    eventId = eventRes.body.data.event._id;
    createdEventIds.push(eventId);

    await request(app)
      .patch(`/api/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${organizer.token}`);

    // Create ticket tier (₹250 = 25000 paise)
    const tierRes = await request(app)
      .post(`/api/events/${eventId}/ticket-types`)
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({
        name: 'Standard Ticket',
        price: 25000,
        totalCapacity: 20
      });
    ticketTier = tierRes.body.data.ticketType._id;
    createdTierIds.push(ticketTier);

    // Create booking hold (2 tickets)
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        eventId,
        items: [{ ticketTypeId: ticketTier, quantity: 2 }]
      });
    bookingId = bookRes.body.data.booking._id;
    createdBookingIds.push(bookingId);
  });

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await Ticket.deleteMany({ booking: { $in: createdBookingIds } });
      await Payment.deleteMany({ booking: { $in: createdBookingIds } });
      await Booking.deleteMany({ _id: { $in: createdBookingIds } });
    }
    if (createdTierIds.length > 0) {
      await TicketType.deleteMany({ _id: { $in: createdTierIds } });
    }
    if (createdEventIds.length > 0) {
      await Event.deleteMany({ _id: { $in: createdEventIds } });
    }
    if (createdOrgIds.length > 0) {
      await Membership.deleteMany({ organization: { $in: createdOrgIds } });
      await Organization.deleteMany({ _id: { $in: createdOrgIds } });
    }
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    await WebhookEvent.deleteMany({ eventId: { $regex: uniqueSuffix.toString() } });
    await mongoose.connection.close();
  });

  describe('Order Creation (POST /api/payments/create-order)', () => {
    it('should block unauthenticated order creation with 401', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .send({ bookingId });

      expect(res.statusCode).toBe(401);
    });

    it('should block outsider from creating order for customer booking with 403', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({ bookingId });

      expect(res.statusCode).toBe(403);
    });

    it('should create Razorpay order for valid booking hold with 200', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ bookingId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toHaveProperty('orderId');
      expect(res.body.data.order.amount).toBe(50000); // 2 * 25000 paise = 50000
      expect(res.body.data.order.currency).toBe('INR');

      orderId = res.body.data.order.orderId;

      // Verify Payment record was created in DB
      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      expect(payment).toBeDefined();
      expect(payment.status).toBe('CREATED');
    });
  });

  describe('Payment Verification (POST /api/payments/verify)', () => {
    const fakePaymentId = `pay_test_${Date.now()}`;

    it('should reject invalid or forged payment signature with 400', async () => {
      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          bookingId,
          razorpayOrderId: orderId,
          razorpayPaymentId: fakePaymentId,
          razorpaySignature: 'forged_fake_signature_12345'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid payment signature');
    });

    it('should reject verification of unknown or untrusted order with 404', async () => {
      const unknownOrderId = `order_untrusted_${Date.now()}`;
      const unknownPaymentId = `pay_untrusted_${Date.now()}`;
      const validSig = generateValidPaymentSignature(unknownOrderId, unknownPaymentId);

      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          bookingId,
          razorpayOrderId: unknownOrderId,
          razorpayPaymentId: unknownPaymentId,
          razorpaySignature: validSig
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('Payment order not found or untrusted');

      // Verify no rogue payment was created
      const roguePayment = await Payment.findOne({ razorpayOrderId: unknownOrderId });
      expect(roguePayment).toBeNull();
    });

    it('should reject verification if payment order belongs to another user with 403', async () => {
      const validSig = generateValidPaymentSignature(orderId, fakePaymentId);

      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({
          bookingId,
          razorpayOrderId: orderId,
          razorpayPaymentId: fakePaymentId,
          razorpaySignature: validSig
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('does not belong to you');
    });

    it('should verify valid HMAC signature, capture payment, confirm booking, and generate tickets with 200', async () => {
      const validSig = generateValidPaymentSignature(orderId, fakePaymentId);

      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          bookingId,
          razorpayOrderId: orderId,
          razorpayPaymentId: fakePaymentId,
          razorpaySignature: validSig
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.status).toBe('CAPTURED');
      expect(res.body.data.booking.status).toBe('CONFIRMED');
      expect(Array.isArray(res.body.data.tickets)).toBe(true);
      expect(res.body.data.tickets.length).toBe(2);

      // Verify TicketType inventory transitioned: reservedCount decremented, soldCount incremented
      const tier = await TicketType.findById(ticketTier);
      expect(tier.reservedCount).toBe(0);
      expect(tier.soldCount).toBe(2);
    });
  });

  describe('Webhook & Idempotency (POST /api/payments/webhook)', () => {
    it('should reject webhook with invalid signature with 400', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        event_id: `evt_test_${uniqueSuffix}`
      });

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'invalid_sig')
        .set('Content-Type', 'application/json')
        .send(webhookPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid webhook signature');
    });

    it('should process valid webhook and provide idempotency when repeated', async () => {
      const webhookEventId = `evt_webhook_${uniqueSuffix}`;
      const payloadObj = {
        event: 'order.paid',
        event_id: webhookEventId,
        payload: {
          payment: {
            entity: {
              id: `pay_hook_${uniqueSuffix}`,
              order_id: orderId,
              status: 'captured'
            }
          }
        }
      };
      const payloadString = JSON.stringify(payloadObj);
      const validSig = generateWebhookSignature(payloadString);

      // First delivery: processes successfully
      const firstRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', validSig)
        .set('Content-Type', 'application/json')
        .send(payloadString);

      expect(firstRes.statusCode).toBe(200);
      expect(firstRes.body.data.status).toBe('processed');

      // Second delivery (duplicate retry from gateway): must be ignored cleanly (Idempotent 200)
      const secondRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', validSig)
        .set('Content-Type', 'application/json')
        .send(payloadString);

      expect(secondRes.statusCode).toBe(200);
      expect(secondRes.body.data.status).toBe('ignored');
      expect(secondRes.body.data.message).toContain('already processed');
    });

    it('should mark WebhookEvent as FAILED on business error and allow retry to succeed when re-delivered', async () => {
      // Create a fresh booking hold and payment order to test failure recovery
      const holdRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          eventId,
          items: [{ ticketTypeId: ticketTier, quantity: 1 }]
        });
      expect(holdRes.statusCode).toBe(201);
      const retryBookingId = holdRes.body.data.booking._id;

      const orderRes = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ bookingId: retryBookingId });
      expect(orderRes.statusCode).toBe(200);
      const retryOrderId = orderRes.body.data.order.orderId;

      const webhookEventId = `evt_fail_retry_${Date.now()}`;
      const payloadObj = {
        event: 'payment.captured',
        event_id: webhookEventId,
        payload: {
          payment: {
            entity: {
              id: `pay_retry_${Date.now()}`,
              order_id: retryOrderId,
              status: 'captured'
            }
          }
        }
      };
      const payloadString = JSON.stringify(payloadObj);
      const validSig = generateWebhookSignature(payloadString);

      // Simulate transient failure during ticket generation on 1st webhook delivery
      const ticketSpy = jest.spyOn(ticketService, 'generateTicketsForBooking')
        .mockRejectedValueOnce(new Error('Simulated transient ticket generation failure'));

      // First delivery: must fail with 500, recorded as FAILED
      const failRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', validSig)
        .set('Content-Type', 'application/json')
        .send(payloadString);

      expect(failRes.statusCode).toBe(500);

      const failedDoc = await WebhookEvent.findOne({ eventId: webhookEventId });
      expect(failedDoc).not.toBeNull();
      expect(failedDoc.status).toBe('FAILED');
      expect(failedDoc.errorMessage).toContain('Simulated transient ticket generation failure');

      ticketSpy.mockRestore();

      // Gateway retries webhook: must now succeed with 200 and transition status to PROCESSED
      const retryRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', validSig)
        .set('Content-Type', 'application/json')
        .send(payloadString);

      expect(retryRes.statusCode).toBe(200);
      expect(retryRes.body.data.status).toBe('processed');

      const processedDoc = await WebhookEvent.findOne({ eventId: webhookEventId });
      expect(processedDoc.status).toBe('PROCESSED');
      expect(processedDoc.attempts).toBe(2);
      expect(processedDoc.errorMessage).toBeNull();
    });

    it('should handle concurrent deliveries of the same webhook without errors', async () => {
      const webhookEventId = `evt_concurrent_${Date.now()}`;
      const payloadObj = {
        event: 'payment.failed',
        event_id: webhookEventId,
        payload: {
          payment: {
            entity: {
              id: `pay_conc_${Date.now()}`,
              order_id: `order_fake_${Date.now()}`,
              error_description: 'Card declined'
            }
          }
        }
      };
      const payloadString = JSON.stringify(payloadObj);
      const validSig = generateWebhookSignature(payloadString);

      // Fire 2 concurrent deliveries of the exact same event
      const [resA, resB] = await Promise.all([
        request(app)
          .post('/api/payments/webhook')
          .set('x-razorpay-signature', validSig)
          .set('Content-Type', 'application/json')
          .send(payloadString),
        request(app)
          .post('/api/payments/webhook')
          .set('x-razorpay-signature', validSig)
          .set('Content-Type', 'application/json')
          .send(payloadString)
      ]);

      // Both must return 200 without duplicate key crashes
      expect(resA.statusCode).toBe(200);
      expect(resB.statusCode).toBe(200);

      const statuses = [resA.body.data.status, resB.body.data.status];
      expect(statuses).toContain('processed');
      // The other concurrent request must be ignored (either in-flight or already processed)
      expect(statuses).toContain('ignored');
    });

    it('should handle concurrent POST /verify and payment.captured webhook without 500s or duplicate tickets', async () => {
      const holdRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          eventId,
          items: [{ ticketTypeId: ticketTier, quantity: 2 }]
        });
      expect(holdRes.statusCode).toBe(201);
      const raceBookingId = holdRes.body.data.booking._id;

      const orderRes = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ bookingId: raceBookingId });
      expect(orderRes.statusCode).toBe(200);
      const raceOrderId = orderRes.body.data.order.orderId;

      const racePaymentId = `pay_race_${Date.now()}`;
      const validPaymentSig = generateValidPaymentSignature(raceOrderId, racePaymentId);

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        event_id: `evt_race_${Date.now()}`,
        payload: {
          payment: {
            entity: {
              id: racePaymentId,
              order_id: raceOrderId,
              status: 'captured'
            }
          }
        }
      });
      const validWebhookSig = generateWebhookSignature(webhookPayload);

      // Fire frontend verification and Razorpay webhook concurrently
      const [verifyRes, webhookRes] = await Promise.all([
        request(app)
          .post('/api/payments/verify')
          .set('Authorization', `Bearer ${customer.token}`)
          .send({
            bookingId: raceBookingId,
            razorpayOrderId: raceOrderId,
            razorpayPaymentId: racePaymentId,
            razorpaySignature: validPaymentSig
          }),
        request(app)
          .post('/api/payments/webhook')
          .set('x-razorpay-signature', validWebhookSig)
          .set('Content-Type', 'application/json')
          .send(webhookPayload)
      ]);

      expect(verifyRes.statusCode).toBe(200);
      expect(webhookRes.statusCode).toBe(200);
      expect(verifyRes.body.data.booking.status).toBe('CONFIRMED');
      expect(verifyRes.body.data.tickets).toHaveLength(2);

      // Verify exactly 2 tickets exist in DB (no duplicates)
      const ticketsInDb = await Ticket.find({ booking: raceBookingId });
      expect(ticketsInDb).toHaveLength(2);

      // Verify booking is confirmed once
      const bookingInDb = await Booking.findById(raceBookingId);
      expect(bookingInDb.status).toBe('CONFIRMED');
    });

    it('POST /api/payments/demo-complete should complete sandbox order_test_* in non-production and return 403 in production', async () => {
      const demoBook = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ eventId, items: [{ ticketTypeId: ticketTier, quantity: 1 }] });
      const demoBookingId = demoBook.body.data.booking._id;
      createdBookingIds.push(demoBookingId);

      const demoOrderRes = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ bookingId: demoBookingId });
      const demoOrderId = demoOrderRes.body.data.order.orderId;
      expect(demoOrderId.startsWith('order_test_')).toBe(true);

      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const prodBlock = await request(app)
        .post('/api/payments/demo-complete')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ bookingId: demoBookingId, razorpayOrderId: demoOrderId });
      process.env.NODE_ENV = prevEnv;
      expect(prodBlock.statusCode).toBe(403);

      const okRes = await request(app)
        .post('/api/payments/demo-complete')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ bookingId: demoBookingId, razorpayOrderId: demoOrderId });
      expect(okRes.statusCode).toBe(200);
      expect(okRes.body.data.booking.status).toBe('CONFIRMED');
      expect(okRes.body.data.tickets).toHaveLength(1);
    });
  });
});
