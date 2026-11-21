# ReserveX 🎟️

ReserveX is a multi-tenant event ticketing and booking platform tailored for small organizers such as college fests, technical clubs, workshops, and hackathons. It is engineered with a primary focus on concurrency-safe bookings, transactional data integrity, signed payment recovery, and strict multi-tenant isolation.

---

## 🛠️ Tech Stack & Architectural Decisions

- **Runtime & Language**: Node.js with Plain JavaScript (CommonJS, no TypeScript).
- **Backend Framework**: Express.js.
- **Database & ODM**: MongoDB Atlas (replica set) + Mongoose.
- **Transaction Safety**: Multi-document replica set sessions (`session.withTransaction`) & atomic conditional updates (`$expr`).
- **Authentication**: JWT (JSON Web Tokens) with `httpOnly` cookie support + `bcrypt` password hashing (10 salt rounds).
- **Multi-Tenancy & RBAC**:
  - Global `User` accounts (`role: 'customer'`).
  - Scoped `Membership` model per organization (`role: 'owner'` | `'staff'`).
  - Middleware-enforced data isolation (`requireOrgRole`).
- **Payments & Webhooks**: Razorpay (order creation, HMAC-SHA256 checkout verification, and raw-body signed webhook deduplication).
- **Digital Ticketing**: HMAC-SHA256 signed QR tokens (base64url) with single-use check-in enforcement.
- **Validation**: Zod (v4) schema validation middleware.
- **Security**: Helmet, CORS with credentials, centralized error handling (`AppError`), rate limiting on auth endpoints.
- **Testing**: Jest + Supertest running live integration tests against MongoDB Atlas replica sets.

---

## 📂 Project Structure

```text
ReserveX/
├── client/                     # Placeholder for React + Vite frontend
│   └── README.md
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # Native Mongoose MongoDB Atlas connection
│   │   │   └── razorpay.js     # Razorpay SDK client instance
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
│   │   │   └── expireHolds.job.js        # Background cleaner for expired booking holds
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js        # JWT verify + global RBAC
│   │   │   ├── error.middleware.js       # Centralized 4-argument Express error handler
│   │   │   ├── org.middleware.js         # Multi-tenant organization isolation (requireOrgRole)
│   │   │   ├── rateLimit.middleware.js   # Express rate limiters for auth
│   │   │   └── validate.middleware.js    # Reusable Zod validation middleware
│   │   ├── models/
│   │   │   ├── booking.model.js          # Booking holds, items, and references
│   │   │   ├── event.model.js            # Events (draft, published, cancelled)
│   │   │   ├── membership.model.js       # User-to-Organization relationship
│   │   │   ├── organization.model.js     # Organizations & atomic owner counts
│   │   │   ├── payment.model.js          # Razorpay orders, payments, amounts, and statuses
│   │   │   ├── ticket.model.js           # Digital tickets with signed QR tokens
│   │   │   ├── ticketType.model.js       # Ticket tiers, prices in paise, inventory counters
│   │   │   ├── user.model.js             # Global user accounts
│   │   │   └── webhookEvent.model.js     # Webhook idempotency and audit logs
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
│   │   │   ├── booking.service.js        # Concurrency-safe holds, cancellations, background expiry
│   │   │   ├── event.service.js          # Event lifecycles, public discovery, organizer updates
│   │   │   ├── organization.service.js   # Org creation, co-owner management, transactional last-owner guard
│   │   │   ├── payment.service.js        # Razorpay orders, HMAC signature verification, signed webhooks
│   │   │   ├── ticket.service.js         # QR token generation, check-in validation, attendee list
│   │   │   └── ticketType.service.js     # Ticket tier creation, capacity guardrails
│   │   ├── utils/
│   │   │   └── errors.js                 # Custom operational error class (AppError)
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── booking.validator.js
│   │   │   ├── event.validator.js
│   │   │   ├── organization.validator.js
│   │   │   ├── payment.validator.js
│   │   │   ├── ticket.validator.js
│   │   │   └── ticketType.validator.js
│   │   ├── app.js              # Express app definition (routes, middleware, error handler)
│   │   └── server.js           # Server bootstrap & background job runner
│   ├── tests/
│   │   ├── auth.test.js        # Auth integration tests (9 tests)
│   │   ├── booking.test.js     # Parallel load concurrency & hold expiry tests (8 tests)
│   │   ├── event.test.js       # Event lifecycle & public discovery tests (14 tests)
│   │   ├── health.test.js      # Health check tests (1 test)
│   │   ├── organization.test.js# Multi-tenancy isolation & race condition tests (10 tests)
│   │   ├── payment.test.js     # Razorpay orders, HMAC verification, webhook idempotency tests (11 tests)
│   │   ├── ticket.test.js      # QR token signing, single-use check-in, organizer management tests (8 tests)
│   │   └── ticketType.test.js  # Ticket tier & capacity guardrail tests (11 tests)
│   ├── .env.example
│   ├── jest.config.js
│   └── package.json
├── .env.example
├── AGENTS.md
├── ARCHITECTURE.md
├── PROJECT_STATUS.md
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher (v24 recommended)
- **MongoDB Atlas**: An active MongoDB Atlas replica set cluster (transactions require a replica set)
- **Git**

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
Ensure required variables are configured in `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/reservex?retryWrites=true&w=majority"
JWT_SECRET="reservex-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
HOLD_TTL_MINUTES=10
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
QR_SIGNING_SECRET="reservex-secret-qr-key-min-32-chars"
```

### 3. Install Dependencies
```bash
cd server
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
The server will connect to MongoDB Atlas and listen on `http://localhost:5000`.

### 5. Run the Automated Test Suite
To run all 72 integration tests live against MongoDB Atlas:
```bash
npm test
```

---

## 📡 Core API Overview

| Group | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **System** | `GET` | `/health` | Public | Service health & uptime status |
| **Auth** | `POST` | `/api/auth/register` | Public | Customer registration & JWT issuing |
| **Auth** | `POST` | `/api/auth/login` | Public | Login credentials check & cookie/token |
| **Auth** | `GET` | `/api/auth/me` | Logged In | Fetch logged-in user profile |
| **Orgs** | `POST` | `/api/organizations` | Logged In | Create org & assign creator as owner |
| **Orgs** | `GET` | `/api/organizations/me` | Logged In | List user's organizations and roles |
| **Orgs** | `POST` | `/api/organizations/:id/members` | Owner | Add staff or co-owner by email |
| **Orgs** | `DELETE`| `/api/organizations/:id/members/:userId` | Owner | Remove member (protected by last-owner guard) |
| **Events** | `GET` | `/api/events` | Public | Search & list published events |
| **Events** | `GET` | `/api/events/:id` | Public | Fetch published event details |
| **Events** | `POST` | `/api/organizations/:id/events` | Owner/Staff | Create draft event |
| **Events** | `PATCH`| `/api/events/:id` | Owner/Staff | Update event details |
| **Events** | `PATCH`| `/api/events/:id/publish` | Owner/Staff | Publish draft event |
| **Events** | `PATCH`| `/api/events/:id/cancel` | Owner/Staff | Cancel event |
| **Ticket Types**| `GET` | `/api/events/:id/ticket-types` | Public | List active ticket tiers for an event |
| **Ticket Types**| `POST` | `/api/events/:id/ticket-types` | Owner/Staff | Create ticket tier (price in paise, capacity) |
| **Ticket Types**| `PATCH`| `/api/ticket-types/:id` | Owner/Staff | Update tier (protected by committed capacity guardrail) |
| **Ticket Types**| `PATCH`| `/api/ticket-types/:id/toggle` | Owner/Staff | Toggle active status |
| **Bookings**| `POST` | `/api/bookings` | Logged In | Concurrency-safe atomic booking hold |
| **Bookings**| `GET` | `/api/bookings/my` | Logged In | List customer's booking history |
| **Bookings**| `GET` | `/api/bookings/:id` | Customer/Org | Fetch booking detail |
| **Bookings**| `POST` | `/api/bookings/:id/cancel` | Customer | Release hold back to inventory |
| **Bookings**| `GET` | `/api/events/:id/bookings` | Owner/Staff | List all bookings for an event |
| **Payments**| `POST` | `/api/payments/create-order` | Logged In | Create Razorpay order for active booking hold |
| **Payments**| `POST` | `/api/payments/verify` | Logged In | Verify payment HMAC signature, confirm booking & issue tickets |
| **Payments**| `POST` | `/api/payments/webhook` | Webhook | Idempotent raw-body signed Razorpay webhook handler |
| **Tickets** | `GET` | `/api/tickets/my` | Logged In | Retrieve customer's digital tickets with signed QR tokens |
| **Tickets** | `GET` | `/api/tickets/:id` | Customer/Org | View single digital ticket with event & QR token |
| **Tickets** | `POST` | `/api/tickets/checkin` | Owner/Staff | Verify signed QR token & enforce single-use gate entry |
| **Tickets** | `GET` | `/api/events/:id/tickets` | Owner/Staff | Organizer view of attendee list & check-in statuses |

---

## 🧠 Key Engineering Concepts & Guarantees

1. **Concurrency-Safe Booking (Zero-Overselling)**:
   Inventory reservations operate via atomic conditional updates:
   $$\text{Available Capacity} = \text{totalCapacity} - (\text{reservedCount} + \text{soldCount})$$
   Using `$expr: { $gte: [{ $subtract: [...] }, qty] }` in `TicketType.findOneAndUpdate(...)`, MongoDB executes capacity evaluation atomically at the document level. If parallel requests hit the last seats, only the allowed quantity succeeds; the rest are immediately rejected with clean 400 errors.

2. **Integer Paise for Money Calculations**:
   Prices and totals are strictly stored as integers in paise (`₹499.00` = `49900`). This completely prevents floating-point rounding discrepancies during payment calculations.

3. **Multi-Tenant Isolation**:
   Every organizer action verifies the caller's `Membership` record against the event's parent organization. Staff or owners of Organization A receive `403 Forbidden` if attempting to modify Organization B's events or tickets.

4. **Background Hold Expiry Cleaner**:
   Unpaid holds automatically expire after `HOLD_TTL_MINUTES`. A background worker running every 60 seconds finds expired holds and returns their reserved seats to the available inventory.

5. **Cryptographically Signed QR Tickets & Single-Use Check-In**:
   Each ticket generated upon successful payment contains an HMAC-SHA256 signed payload formatted as a URL-safe base64 string (`ticketNumber`, `eventId`, `bookingId`, `issuedAt`). During check-in, the signature is cryptographically verified against the server secret before checking the ticket in. Duplicate scans are rejected with `409 Conflict`.

6. **Idempotent Webhooks & Payment Recovery**:
   Incoming Razorpay webhooks (`payment.captured`, `order.paid`) verify the raw-body HMAC-SHA256 signature against `RAZORPAY_WEBHOOK_SECRET`. Processed event IDs are persisted in a dedicated `WebhookEvent` collection to prevent duplicate execution when the gateway retries webhooks.
