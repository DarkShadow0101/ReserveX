# ARCHITECTURE.md — ReserveX

Status: CONFIRMED & IMPLEMENTED v1.0 (2026-11-12). All Phase 1 through 7 core capabilities are fully implemented, verified live against MongoDB Atlas, and documented below.

---

## 1. Product Scope **[CONFIRMED]**

ReserveX is a multi-tenant event ticketing and booking platform designed for small organizers (such as college fests, technical clubs, workshops, and hackathons).

### Organizer Capabilities
- Create and manage organizations with team members (`owner` and `staff` roles).
- Create, update, publish, and cancel events.
- Configure ticket tiers, prices in paise, total capacity, and sales schedules.
- Monitor event bookings, attendance, and ticket check-in progress.
- Validate attendee tickets at the gate using cryptographic QR code scanning.

### Customer Capabilities
- Browse published events and discover active ticket tiers.
- Reserve tickets with temporary concurrency-safe booking holds (10-minute TTL).
- Complete payments via Razorpay (test mode) with HMAC-SHA256 signature verification.
- Receive cryptographically signed digital QR tickets upon confirmation.
- View booking history and retrieve tickets anytime.
- Cancel eligible unpaid holds to release seats back to the community immediately.

### Core Architectural Differentiators
1. **Concurrency-Safe Booking Engine**: Atomic document-level capacity evaluation guarantees zero-overselling even under heavy parallel load.
2. **Reliable Payment & Webhook Recovery**: Cryptographic HMAC-SHA256 verification, raw-body signature validation, deduplication via `WebhookEvent`, and transactional booking confirmation.
3. **Cryptographically Signed Digital QR Tickets**: Base64url signed tokens preventing ticket counterfeiting and enforcing strict single-use check-in.

---

## 2. Tech Stack **[CONFIRMED]**

| Layer | Choice | Rationale |
|---|---|---|
| **Language** | Plain JavaScript (Node.js CommonJS, no TypeScript) | Clean, robust, and zero build/transpilation friction |
| **Backend** | Node.js + Express.js | Mature ecosystem, lightweight request pipeline |
| **Database** | MongoDB Atlas (replica set) | High availability, document modeling, and multi-document ACID transactions |
| **Data Access** | Mongoose | Strict schema definitions, hooks, validation, and atomic conditional queries |
| **Auth & Security** | JWT (httpOnly cookies / Bearer headers) + bcrypt (10 rounds) | Stateless authorization with secure password hashing |
| **Validation** | Zod (v4) | Strict runtime schema parsing and informative error responses |
| **Payments** | Razorpay (test mode) | Industry standard in India, supports orders, webhooks, and signatures |
| **Digital Tickets**| HMAC-SHA256 signed QR tokens | Offline-verifiable signature envelope without heavy cryptographic overhead |
| **Testing** | Jest + Supertest | Integration test suite running live against real MongoDB Atlas replica sets |
| **Frontend** | React + Vite + Tailwind CSS | Fast dev server, modern UI components (planned for Phase 8) |

---

## 3. Backend Architecture **[CONFIRMED]**

Request Flow: `Route -> Middleware (Auth, OrgRole, Validation) -> Controller -> Service (Transactions & Business Logic) -> Mongoose Model -> MongoDB Atlas`

```text
ReserveX/
├── client/                          # React + Vite (Phase 8)
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Native Mongoose connection to MongoDB Atlas
│   │   │   └── razorpay.js          # Razorpay SDK initialization
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── health.controller.js
│   │   │   ├── organization.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── ticket.controller.js
│   │   │   └── ticketType.controller.js
│   │   ├── jobs/
│   │   │   └── expireHolds.job.js   # Background worker cleaning expired booking holds
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT authentication & global role guards
│   │   │   ├── error.middleware.js  # Centralized 4-argument Express error handler
│   │   │   ├── org.middleware.js    # Multi-tenant isolation guard (requireOrgRole)
│   │   │   ├── rateLimit.middleware.js # Express rate limiters for auth
│   │   │   └── validate.middleware.js # Reusable Zod validation middleware
│   │   ├── models/
│   │   │   ├── booking.model.js     # Booking holds, items, and statuses
│   │   │   ├── event.model.js       # Events (draft, published, cancelled)
│   │   │   ├── membership.model.js  # User-to-Organization membership relations
│   │   │   ├── organization.model.js # Organizations & atomic owner counts
│   │   │   ├── payment.model.js     # Gateway orders, capture timestamps, references
│   │   │   ├── ticket.model.js      # Digital tickets, QR tokens, and check-in statuses
│   │   │   ├── ticketType.model.js  # Ticket tiers, prices in paise, inventory counters
│   │   │   ├── user.model.js        # Global user accounts
│   │   │   └── webhookEvent.model.js # Webhook idempotency audit records
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── event.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── organization.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── ticket.routes.js
│   │   │   └── ticketType.routes.js
│   │   ├── services/
│   │   │   ├── booking.service.js   # Concurrency-safe holds, cancellations, expiry
│   │   │   ├── event.service.js     # Lifecycle, public discovery, organizer updates
│   │   │   ├── organization.service.js # Org creation, co-owners, last-owner guard
│   │   │   ├── payment.service.js   # Razorpay orders, HMAC checkout, signed webhooks
│   │   │   ├── ticket.service.js    # QR token signing, check-in validation, attendee list
│   │   │   └── ticketType.service.js # Tiers creation, capacity guardrails
│   │   ├── utils/
│   │   │   └── errors.js            # Custom operational error class (AppError)
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── booking.validator.js
│   │   │   ├── event.validator.js
│   │   │   ├── organization.validator.js
│   │   │   ├── payment.validator.js
│   │   │   ├── ticket.validator.js
│   │   │   └── ticketType.validator.js
│   │   ├── app.js                   # Express app configuration & middleware pipeline
│   │   └── server.js                # Server startup & background jobs runner
│   └── tests/
│       ├── auth.test.js             # Auth integration tests (9 tests)
│       ├── booking.test.js          # Parallel load concurrency tests (8 tests)
│       ├── event.test.js            # Event lifecycle & discovery tests (14 tests)
│       ├── health.test.js           # Health check tests (1 test)
│       ├── organization.test.js     # Multi-tenancy isolation & race tests (10 tests)
│       ├── payment.test.js          # Razorpay order, verify & webhook tests (11 tests)
│       ├── ticket.test.js           # QR signing, check-in single-use tests (8 tests)
│       └── ticketType.test.js       # Ticket tier & capacity guardrail tests (11 tests)
├── .env.example
├── AGENTS.md
├── ARCHITECTURE.md
├── PROJECT_STATUS.md
└── README.md
```

---

## 4. Multi-Tenancy & Roles **[CONFIRMED]**

ReserveX implements organization-scoped multi-tenancy. A single global `User` account can belong to multiple organizations with different privileges.

| Role | Scope | Permissions |
|---|---|---|
| `owner` | Organization-scoped | Full administrative control: manage org settings, add/remove team members, manage all events, manage tickets and check-in. |
| `staff` | Organization-scoped | Operational control: create and manage events, configure ticket tiers, scan attendee tickets at check-in. Cannot manage org members or delete the organization. |
| `customer` | Global user role | Public discovery, reserve tickets, pay for bookings, view own bookings and tickets, cancel eligible holds. |

### Isolation Rules
1. Every organizer endpoint enforces `requireOrgRole(['owner', 'staff'])` in [org.middleware.js](file:///c:/Users/punit/OneDrive/Desktop/web%20dev/ReserveX/server/src/middleware/org.middleware.js).
2. Cross-tenant access is strictly blocked: an owner of Organization A receives `403 Forbidden` if attempting to modify Organization B's events or tickets.
3. Last-owner protection: An organization can never be orphaned. Removing an owner checks and decrements `ownerCount` atomically within a transaction; the last owner cannot be removed.

---

## 5. Database Design & Schemas **[CONFIRMED]**

All models are managed via Mongoose on MongoDB Atlas replica sets. Money is strictly stored as integers in paise (`₹1.00 = 100 paise`).

### `users`
- `_id`: ObjectId
- `fullName`: String (trimmed, required)
- `email`: String (lowercase, unique, indexed)
- `passwordHash`: String (bcrypt hash, excluded in JSON transforms)
- `role`: String (`'customer'`)
- `timestamps`: `createdAt`, `updatedAt`

### `organizations`
- `_id`: ObjectId
- `name`: String (trimmed, required)
- `ownerCount`: Number (default: 1, guarded by transactions)
- `timestamps`: `createdAt`, `updatedAt`

### `memberships`
- `_id`: ObjectId
- `user`: ObjectId -> `users`
- `organization`: ObjectId -> `organizations`
- `role`: String (`'owner'` | `'staff'`)
- **Index**: Compound unique `{ user: 1, organization: 1 }`

### `events`
- `_id`: ObjectId
- `organization`: ObjectId -> `organizations` (indexed)
- `title`: String
- `description`: String
- `venue`: String
- `startsAt`: Date
- `endsAt`: Date
- `status`: String (`'draft'` | `'published'` | `'cancelled'`)
- **Index**: `{ organization: 1, status: 1 }`

### `ticket_types`
- `_id`: ObjectId
- `event`: ObjectId -> `events` (indexed)
- `name`: String (e.g. "Early Bird", "VIP")
- `price`: Number (integer paise, non-negative)
- `totalCapacity`: Number (minimum: 1)
- `reservedCount`: Number (default: 0, temporary holds)
- `soldCount`: Number (default: 0, confirmed paid tickets)
- `isActive`: Boolean (default: true)
- `saleStartsAt`: Date (optional)
- `saleEndsAt`: Date (optional)
- **Constraint**: `reservedCount + soldCount <= totalCapacity`

### `bookings`
- `_id`: ObjectId
- `user`: ObjectId -> `users` (indexed)
- `event`: ObjectId -> `events` (indexed)
- `bookingReference`: String (uppercase alphanumeric, unique)
- `items`: Embedded array:
  - `ticketType`: ObjectId -> `ticket_types`
  - `name`: String
  - `quantity`: Number (positive integer)
  - `unitPrice`: Number (paise)
- `totalAmount`: Number (paise)
- `status`: String (`'PENDING_PAYMENT'` | `'CONFIRMED'` | `'CANCELLED'` | `'EXPIRED'` | `'REFUND_PENDING'`)
- `holdExpiresAt`: Date (indexed)
- `paymentReference`: String (optional Razorpay payment ID)
- `timestamps`: `createdAt`, `updatedAt`

### `payments`
- `_id`: ObjectId
- `booking`: ObjectId -> `bookings` (indexed)
- `user`: ObjectId -> `users`
- `razorpayOrderId`: String (unique, indexed)
- `razorpayPaymentId`: String (optional)
- `razorpaySignature`: String (optional)
- `amount`: Number (paise)
- `currency`: String (`'INR'`)
- `status`: String (`'CREATED'` | `'CAPTURED'` | `'FAILED'` | `'REFUNDED'`)
- `failureReason`: String (optional)
- `timestamps`: `createdAt`, `updatedAt`

### `tickets`
- `_id`: ObjectId
- `ticketNumber`: String (unique, indexed)
- `booking`: ObjectId -> `bookings` (indexed)
- `event`: ObjectId -> `events` (indexed)
- `ticketType`: ObjectId -> `ticket_types`
- `tierName`: String
- `customer`: ObjectId -> `users` (indexed)
- `customerName`: String
- `customerEmail`: String
- `qrToken`: String (HMAC-SHA256 signed base64url envelope)
- `status`: String (`'VALID'` | `'USED'` | `'CANCELLED'`)
- `usedAt`: Date (set upon check-in)
- `checkedInBy`: ObjectId -> `users` (staff scanner ID)
- `timestamps`: `createdAt`, `updatedAt`

### `webhook_events`
- `_id`: ObjectId
- `eventId`: String (unique provider event ID, indexed)
- `eventType`: String (`'payment.captured'` | `'order.paid'`, etc.)
- `payload`: Schema.Types.Mixed
- `status`: String (`'PROCESSED'` | `'FAILED'`)
- `timestamps`: `receivedAt`, `updatedAt`

---

## 6. State Machines **[CONFIRMED]**

### Booking Lifecycle
```
PENDING_PAYMENT (Hold Active) ──payment captured──▶ CONFIRMED
      │
      ├──hold expires (TTL) / customer cancels──▶ EXPIRED / CANCELLED (Inventory Released)
      │
      └──admin refund initiated───────────────▶ REFUND_PENDING
```

### Payment Lifecycle
```
CREATED (Order Issued) ──payment verified / webhook──▶ CAPTURED
      │
      ├──gateway failure / signature invalid──────▶ FAILED
      │
      └──refund processed───────────────────────▶ REFUNDED
```

### Digital Ticket Lifecycle
```
VALID (Issued) ──gate QR scan & check-in──▶ USED (Single-Use Locked)
      │
      └──booking cancelled / refunded───▶ CANCELLED
```

---

## 7. Concurrency-Safe Booking & Inventory Engine **[CONFIRMED]**

### Invariants
1. **Zero Overselling**: The sum of `reservedCount` and `soldCount` for any ticket tier must never exceed `totalCapacity`.
2. **Atomic Inventory Reservation**: Reservations happen in a single document-level atomic query executed inside a multi-document replica set transaction:
   ```javascript
   const tier = await TicketType.findOneAndUpdate(
     {
       _id: item.ticketTypeId,
       isActive: true,
       $expr: {
         $gte: [
           { $subtract: ["$totalCapacity", { $add: ["$reservedCount", "$soldCount"] }] },
           item.quantity
         ]
       }
     },
     { $inc: { reservedCount: item.quantity } },
     { session, returnDocument: 'after' }
   );
   ```
   If parallel requests compete for the last available tickets, MongoDB's document lock ensures only the winning transaction evaluates `$gte: true`. The remaining transactions receive `null` and abort with `400 Bad Request`.
3. **Automatic Inventory Release**: If a customer does not complete payment within `HOLD_TTL_MINUTES`, a scheduled background job (`expireHolds.job.js`) cancels the booking and decrements `reservedCount` atomically.

---

## 8. Payment & Webhook Architecture **[CONFIRMED]**

1. **Order Creation (`POST /api/payments/create-order`)**:
   - Customer initiates checkout on an active hold.
   - The server calculates the exact total amount in paise directly from database records (never trusting client amounts).
   - A Razorpay order is created with `notes.bookingId`.
   - A `Payment` document is saved in `CREATED` state.

2. **Checkout Verification (`POST /api/payments/verify`)**:
   - Razorpay Checkout returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
   - Server computes expected HMAC-SHA256 signature:
     $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{secret})$$
   - Inside an atomic transaction:
     - Updates `Payment` to `CAPTURED`.
     - Confirms `Booking` (`PENDING_PAYMENT` -> `CONFIRMED`).
     - Transitions ticket tier inventory: `reservedCount -= qty`, `soldCount += qty`.
     - Issues digital `Ticket` records with HMAC-signed QR tokens.

3. **Signed Webhooks (`POST /api/payments/webhook`)**:
   - Captures asynchronous gateway notifications (`payment.captured`, `order.paid`).
   - Validates `X-Razorpay-Signature` against the raw request body buffer.
   - Idempotently checks `eventId` against `WebhookEvent`. If already processed, returns `200 OK` immediately.
   - If payment is not yet captured locally, confirms the booking and issues tickets in a transaction.

---

## 9. Digital Ticketing & Gate Check-In **[CONFIRMED]**

1. **QR Token Generation**:
   - Upon booking confirmation, each ticket receives a cryptographically signed QR token:
     $$\text{payload} = \{ \text{ticketNumber}, \text{eventId}, \text{bookingId}, \text{issuedAt} \}$$
     $$\text{sig} = \text{HMAC-SHA256}(\text{JSON}(\text{payload}), \text{QR\_SIGNING\_SECRET})$$
   - Encoded as a URL-safe Base64 envelope: `{ payload, sig }`.
2. **Gate Check-In (`POST /api/tickets/checkin`)**:
   - Event staff or organizer scans the attendee's QR token.
   - The server decodes the token and verifies the HMAC-SHA256 signature against `QR_SIGNING_SECRET`.
   - Staff membership permissions are verified against the event's parent organization.
   - **Single-Use Guard**: If ticket status is `USED`, the scan is rejected with `409 Conflict` (reporting exact `usedAt` timestamp).
   - If status is `VALID`, it is updated to `USED` with `checkedInBy` and `usedAt` recorded.

---

## 10. Implemented REST API **[CONFIRMED]**

| Group | Method | Endpoint | Access | Purpose |
|---|---|---|---|---|
| **System** | `GET` | `/health` | Public | Service health & database connectivity |
| **Auth** | `POST` | `/api/auth/register` | Public | Customer registration & JWT issuance |
| **Auth** | `POST` | `/api/auth/login` | Public | Login credentials verification |
| **Auth** | `GET` | `/api/auth/me` | Bearer Token | Authenticated user profile |
| **Organizations**| `POST` | `/api/organizations` | Bearer Token | Create organization & assign creator as owner |
| **Organizations**| `GET` | `/api/organizations/me` | Bearer Token | List user's organizations and roles |
| **Organizations**| `POST` | `/api/organizations/:id/members` | Org Owner | Add staff or co-owner by email |
| **Organizations**| `DELETE`| `/api/organizations/:id/members/:userId`| Org Owner | Remove team member (last-owner guarded) |
| **Events** | `GET` | `/api/events` | Public | Search & list published events |
| **Events** | `GET` | `/api/events/:id` | Public | Public view of published event |
| **Events** | `POST` | `/api/organizations/:id/events` | Owner/Staff | Create draft event |
| **Events** | `GET` | `/api/organizations/:id/events` | Owner/Staff | List all events of an organization |
| **Events** | `GET` | `/api/events/:id/manage` | Owner/Staff | Full event management detail view |
| **Events** | `PATCH`| `/api/events/:id` | Owner/Staff | Update event fields |
| **Events** | `PATCH`| `/api/events/:id/publish` | Owner/Staff | Publish draft event |
| **Events** | `PATCH`| `/api/events/:id/cancel` | Owner/Staff | Cancel event |
| **Ticket Types** | `GET` | `/api/events/:id/ticket-types` | Public | List active ticket tiers for an event |
| **Ticket Types** | `POST` | `/api/events/:id/ticket-types` | Owner/Staff | Create ticket tier (price, capacity) |
| **Ticket Types** | `PATCH`| `/api/ticket-types/:id` | Owner/Staff | Update tier (capacity guardrail protected) |
| **Ticket Types** | `PATCH`| `/api/ticket-types/:id/toggle` | Owner/Staff | Toggle tier active status |
| **Bookings** | `POST` | `/api/bookings` | Bearer Token | Concurrency-safe atomic booking hold |
| **Bookings** | `GET` | `/api/bookings/my` | Bearer Token | Customer's booking history |
| **Bookings** | `GET` | `/api/bookings/:id` | Customer/Org | Fetch booking detail |
| **Bookings** | `POST` | `/api/bookings/:id/cancel` | Customer | Cancel unpaid hold & restore inventory |
| **Bookings** | `GET` | `/api/events/:id/bookings` | Owner/Staff | Organizer view of all event bookings |
| **Payments** | `POST` | `/api/payments/create-order` | Bearer Token | Create Razorpay order for active hold |
| **Payments** | `POST` | `/api/payments/verify` | Bearer Token | Verify checkout HMAC & issue tickets |
| **Payments** | `POST` | `/api/payments/webhook` | Webhook | Signed raw-body Razorpay webhook handler |
| **Tickets** | `GET` | `/api/tickets/my` | Bearer Token | Customer digital tickets with QR tokens |
| **Tickets** | `GET` | `/api/tickets/:id` | Customer/Org | Single ticket detail view |
| **Tickets** | `POST` | `/api/tickets/checkin` | Owner/Staff | Verify signed QR token & check in attendee |
| **Tickets** | `GET` | `/api/events/:id/tickets` | Owner/Staff | Organizer attendee list & attendance counts |

---

## 11. Security & Operational Hardening **[CONFIRMED]**

- **Password Hashing**: `bcryptjs` with 10 salt rounds; password hashes stripped from API outputs.
- **JWT Protection**: Short-lived tokens with secret keys $\ge 32$ characters.
- **HTTP Headers**: `helmet` enabled to mitigate standard web vulnerabilities.
- **Rate Limiting**: `express-rate-limit` on auth endpoints to prevent credential stuffing.
- **Integer Arithmetic**: All monetary amounts are integers in paise.
- **Input Validation**: Reusable Zod schemas enforce types, string lengths, positive integers, and date chronologies.
- **Webhook Security**: Raw-body HMAC-SHA256 signature verification over every gateway webhook.
- **QR Anti-Tampering**: HMAC-SHA256 signatures over all ticket payloads; forged signatures are rejected with `400`.

---

## 12. Testing Strategy & Results **[CONFIRMED]**

Every feature is covered by automated integration tests running live against a MongoDB Atlas replica set cluster.

```text
PASS tests/ticketType.test.js (11 tests)
PASS tests/organization.test.js (10 tests)
PASS tests/health.test.js (1 test)
PASS tests/event.test.js (14 tests)
PASS tests/booking.test.js (8 tests)
PASS tests/auth.test.js (9 tests)
PASS tests/ticket.test.js (8 tests)
PASS tests/payment.test.js (11 tests)

Test Suites: 8 passed, 8 total
Tests:       72 passed, 72 total
Time:        ~39s
```

---

## 13. Resolved Decisions **[CONFIRMED]**

1. **Hold & Inventory Counting**:
   - **Resolution**: Implemented separate `reservedCount` (temporary active holds) and `soldCount` (confirmed purchases) on `TicketType`.
   - **Why**: Allows explicit tracking of live held inventory vs confirmed sales, simplifying capacity calculations and audit reconciliation.
2. **Primary Keys & Identifiers**:
   - **Resolution**: MongoDB `ObjectId` (`_id`) for internal references; human-readable alphanumeric strings for `bookingReference` (e.g. `BK-ABCD1234`) and `ticketNumber` (e.g. `TKT-BK-ABCD1234-01`).
3. **Database Architecture**:
   - **Resolution**: MongoDB Atlas replica set with Mongoose.
   - **Why**: Multi-document replica set transactions (`session.withTransaction`) provide full ACID guarantees alongside flexible document modeling.
4. **Late Payment Handling**:
   - **Resolution**: If a payment succeeds after hold expiry, the idempotent webhook and verification flows confirm the booking and issue tickets if inventory permits.
5. **QR Code Verification**:
   - **Resolution**: HMAC-SHA256 signed base64url envelope (`payload + sig`). Fast, tamper-proof, and verifiable by authorized organizers.

---

## 14. Architecture Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-11-08 | Chose ReserveX (event ticketing + payment recovery) | Highest engineering learning value and real-world portfolio signal |
| 2026-11-08 | Plain JavaScript (CommonJS), no TypeScript | Zero build/transpilation overhead; focuses strictly on backend architecture |
| 2026-11-08 | General admission before seat maps | Achievable MVP milestone without front-end 2D canvas complexity |
| 2026-11-10 | Pivoted from Postgres + Prisma to MongoDB Atlas + Mongoose | Native document modeling, replica set transactions, and atomic `$expr` conditional operators |
| 2026-11-12 | Phase 4: Ticket Tiers & Committed Capacity Guardrails | Prevents organizers from reducing capacity below already committed (held + sold) tickets |
| 2026-11-12 | Phase 5: Concurrency-Safe Booking Engine with `$expr` | Atomic document-level capacity checks prevent overselling under parallel load |
| 2026-11-12 | Phase 6: Razorpay Integration & Webhook Idempotency | HMAC-SHA256 verification and `WebhookEvent` deduplication protect against duplicate orders and webhooks |
| 2026-11-12 | Phase 7: Cryptographic QR Ticketing & Single-Use Check-In | Signed base64url QR tokens with database single-use lock prevent ticket duplication and pass sharing |
