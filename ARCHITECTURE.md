# ARCHITECTURE.md — ReserveX

Status: DRAFT v0.1 (2026-11-08). Items marked **[ASSUMPTION]** are proposals
that need the developer's approval. Items marked **[CONFIRMED]** are decided.

## 1. Product scope

**[CONFIRMED]** ReserveX is a multi-organization event ticketing platform for
small organizers (college fests, workshops, small events).

Organizer features: create organization, invite team members, create and
publish events, configure ticket types and prices, view bookings and revenue,
handle cancellations/refunds, scan QR tickets, view payment exceptions.

Customer features: browse events, book tickets, pay, receive a QR ticket, view
booking history, cancel eligible bookings.

**Differentiators**
1. Concurrency-safe booking (no overselling).
2. Payment recovery: signed webhooks, idempotency, state machine,
   reconciliation.

Be honest in the README: competitors (BookMyShow, District, Townscript,
KonfHub, Hi.Events, pretix) already offer ticketing features. The value of this
project is the engineering reliability, not a claim of market novelty.

## 2. Tech stack **[CONFIRMED]**

| Layer | Choice |
|---|---|
| Language | Plain JavaScript (no TypeScript) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Data access | Mongoose (atomic conditional updates & transactions) |
| Auth | JWT + bcrypt, RBAC |
| Validation | Zod |
| Payments | Razorpay (test mode) |
| Testing | Jest + Supertest, Postman |
| Frontend | React + Vite (built after backend) |
| CI | GitHub Actions |

Not used for now: Redis, queues, WebSockets, AI, microservices, seat maps.

## 3. Backend architecture **[CONFIRMED]**

Request flow: `route -> middleware -> controller -> service -> database`.

```
reservex/
├── client/                  # React + Vite (later)
├── server/
│   ├── src/
│   │   ├── config/          # db (Mongoose MongoDB connection)
│   │   ├── controllers/     # auth, org, event, ticketType, booking
│   │   ├── jobs/            # hold expiry, reconciliation
│   │   ├── middleware/      # auth, org role, validate, error, rateLimit
│   │   ├── models/          # User, Organization, Membership, Event, TicketType, Booking
│   │   ├── routes/          # express routers
│   │   ├── services/        # business logic & transactional workflows
│   │   ├── utils/           # errors (AppError)
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.js           # builds the Express app
│   │   └── server.js        # starts listening
│   └── tests/               # Jest + Supertest suites
├── .env.example
├── AGENTS.md
├── ARCHITECTURE.md
├── PROJECT_STATUS.md
└── README.md
```

## 4. Roles **[ASSUMPTION — confirm before implementing]**

Roles are assigned per organization through a membership table.

| Role | Scope |
|---|---|
| `owner` | Full control of one organization |
| `staff` | Manage events and check-in for their organization |
| `customer` | Browse and book, view only own bookings |

Rules: organization and user IDs come from the JWT/session, never from client
input. Customers can never read other customers' bookings. Staff can never
access another organization's data.

## 5. Database design **[ASSUMPTION — draft; review before migrating]**

Money is stored as integer paise. Use UUID or bigint primary keys
(decide when writing the schema). All tables have `created_at`/`updated_at`.

### users
id, name, email (unique), password_hash, is_active

### organizations
id, name

### memberships
id, user_id, organization_id, role (`owner` | `staff`)
Unique (user_id, organization_id).

### events
id, organization_id, title, description, venue, starts_at, ends_at,
status (`draft` | `published` | `cancelled` | `completed`)

### ticket_types
id, event_id, name, price_paise, capacity, reserved_count
(see Open decisions for how holds and sales are counted),
sale_starts_at, sale_ends_at, max_per_order

**Database guard:** `CHECK (reserved_count >= 0 AND reserved_count <= capacity)`.

### bookings
id, customer_id, event_id, status, total_paise, hold_expires_at,
idempotency_key (unique per customer)

### booking_items
id, booking_id, ticket_type_id, quantity, unit_price_paise

### tickets
id, booking_id, ticket_type_id, qr_token (unique), status
(`valid` | `used` | `cancelled`), used_at

### payments
id, booking_id, razorpay_order_id (unique), razorpay_payment_id,
status, amount_paise, failure_reason

### webhook_events
id, provider_event_id (unique), event_type, payload (jsonb),
received_at, processed_at, status
Purpose: idempotency and audit of every webhook received.

### audit_logs (later) 
id, actor_id, action, entity, entity_id, metadata, created_at

### Indexes (initial)
bookings (customer_id), bookings (status, hold_expires_at),
ticket_types (event_id), payments (razorpay_order_id),
webhook_events (provider_event_id unique).

## 6. State machines **[ASSUMPTION — confirm]**

### Booking
```
HELD ──payment captured──▶ CONFIRMED ──cancel──▶ CANCELLED ──refund done──▶ REFUNDED
 │
 └──hold expires / payment failed──▶ EXPIRED
```
Illegal transitions must be rejected by the service layer and tested.

### Payment
```
CREATED ──captured──▶ CAPTURED ──refund──▶ REFUNDED
   │
   └──failed──▶ FAILED
```

### Ticket
```
VALID ──scanned──▶ USED
VALID ──booking cancelled──▶ CANCELLED
```
A ticket can be used exactly once.

## 7. Booking and inventory design

### Invariants (must always hold, and be tested)
1. A ticket type never sells or holds more than its capacity.
2. A booking can only be CONFIRMED if a captured payment exists for it.
3. A captured payment always ends in a CONFIRMED booking or a refund —
   never in silence.
4. An expired or abandoned hold always releases its inventory.
5. The same webhook event is processed at most once.
6. A ticket can be checked in at most once.

### Approach **[CONFIRMED]**
MongoDB Atlas (no Redis):
- Reserve inventory with a single atomic conditional update inside a replica set session:
  ```javascript
  TicketType.findOneAndUpdate(
    {
      _id: tierId,
      isActive: true,
      $expr: {
        $gte: [
          { $subtract: ["$totalCapacity", { $add: ["$reservedCount", "$soldCount"] }] },
          requestedQty
        ]
      }
    },
    { $inc: { reservedCount: requestedQty } },
    { session, returnDocument: 'after' }
  );
  ```
  If zero documents match, the request fails with 400 (insufficient tickets).
- Create the booking (status `PENDING_PAYMENT`) with `holdExpiresAt` in the same
  transaction.
- A scheduled background job (`jobs/expireHolds.job.js`) releases expired holds and decrements `reservedCount`.
- Compound unique indexes and document constraints are the final guard.
- Idempotency key / booking reference prevents duplicate bookings on retry.

## 8. Payment and webhook design **[ASSUMPTION]**

1. Customer creates a HELD booking.
2. Server creates a Razorpay order (amount computed server-side, never trusted
   from the client).
3. Client pays via Razorpay Checkout; the client-side result is NOT trusted as
   final.
4. Webhook (`payment.captured` / `order.paid`) is the source of truth:
   - Verify `X-Razorpay-Signature` (HMAC-SHA256 over the RAW body).
   - Insert into `webhook_events` keyed by the provider event id; if it already
     exists, return 200 and do nothing.
   - In one transaction: mark payment CAPTURED, booking CONFIRMED, create
     tickets.
5. Handle late payments: if a payment is captured after the hold expired,
   either re-acquire inventory (if available) or mark for refund, and surface
   it in the organizer's payment-exceptions view.
6. Out-of-order events must never move a state backwards.
7. Reconciliation job: periodically list recent payments from Razorpay and
   compare with local records; flag mismatches (paid at gateway but unpaid
   locally, and vice versa).

## 9. REST API (draft) **[ASSUMPTION]**

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Organizations
- POST /api/organizations
- GET /api/organizations/me
- POST /api/organizations/:id/members (owner only)

### Events (organizer)
- POST /api/events
- PATCH /api/events/:id
- POST /api/events/:id/publish
- GET /api/organizer/events
- POST /api/events/:id/ticket-types
- PATCH /api/ticket-types/:id

### Events (public)
- GET /api/events
- GET /api/events/:id

### Bookings
- POST /api/bookings (create hold; requires Idempotency-Key header)
- GET /api/bookings/me
- GET /api/bookings/:id (owner or organizer of that event only)
- POST /api/bookings/:id/cancel

### Payments
- POST /api/bookings/:id/payment-order
- POST /api/payments/verify
- POST /api/webhooks/razorpay (raw body, signature verified)

### Tickets and check-in
- GET /api/tickets/:id (owner only)
- POST /api/checkin (staff only; body contains the QR token)

### Organizer operations
- GET /api/organizer/events/:id/bookings
- GET /api/organizer/payment-exceptions

### System
- GET /api/health

Every route: authenticate, authorize (role + organization/ownership), validate
input with Zod.

## 10. Security **[CONFIRMED]**

bcrypt password hashing, short-lived JWTs, helmet, restrictive CORS, rate
limiting on auth routes, Zod validation everywhere, no password hashes in
responses, secrets only in environment variables, server-side price
calculation, signed QR tokens, raw-body webhook signature verification.

## 11. Testing strategy **[CONFIRMED]**

- Concurrency test: 50-200 parallel requests for limited stock; exactly the
  capacity succeeds, the rest get 409, and the database never exceeds capacity.
- Auth and authorization tests including cross-organization attempts.
- State machine tests: illegal transitions rejected.
- Webhook tests: invalid signature rejected, duplicate event processed once,
  out-of-order event does not move state backwards.
- Hold expiry test: expired holds release inventory.
- Run against a real MongoDB Atlas replica set test database. CI runs everything on each push.
- Do not publish performance numbers until they are measured.

## 12. Environment variables (see .env.example)

MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, PORT, NODE_ENV, CLIENT_URL,
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
QR_SIGNING_SECRET, HOLD_TTL_MINUTES.

## 13. Open decisions

1. Hold counting: single `reserved_count` (holds + sales together) vs separate
   `held_count` and `sold_count`. Leaning single counter for simplicity.
2. UUID vs bigint primary keys.
3. Refund policy and cancellation window rules.
4. Late-payment handling after hold expiry (re-acquire vs refund).
5. Hosting for backend and MongoDB Atlas.
6. Whether staff and owner roles need finer permissions.

## 14. Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-11-08 | Chose ReserveX (event ticketing + payment recovery) | Strongest backend learning value and interview signal for full-stack/backend roles |
| 2026-11-08 | Plain JavaScript, no TypeScript | Developer is not yet comfortable with it; focus on Postgres, transactions, payments |
| 2026-11-08 | Postgres only first, Redis later | Database-level guarantees first; add Redis only with a measured need |
| 2026-11-08 | General admission before seat maps | Keeps MVP achievable |
| 2026-11-08 | No AI features in ReserveX | Would dilute the engineering story; AI exposure lives in SentinelAI |
| 2026-11-10 | Pivoted from Postgres + Prisma to MongoDB Atlas + Mongoose | Native document modeling, replica-set multi-document transactions, and atomic conditional expressions without ORM generation conflicts |
