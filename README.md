# ReserveX 🎟️

ReserveX is a full-stack, multi-tenant event ticketing and venue check-in platform. Customers discover live events, lock tickets with 10-minute concurrency-safe holds, pay via Razorpay, and receive signed single-use QR entry passes; organizers manage teams, events, ticket tiers, revenue analytics, and gate scanning from Organizer Studio.

> **Want a quick walkthrough to explain every feature?** Read [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) for a plain-English architecture & demo script.

---

## 🛠️ Tech Stack & Architectural Decisions

- **Frontend**: React 19 + Vite 8 + Tailwind CSS + Recharts + `qrcode.react` + `html5-qrcode`, supporting persistent **Dark (Obsidian)** & **Light (Gallery Daylight)** themes and lazy route code-splitting.
- **Backend**: Node.js (CommonJS) + Express 5 + Zod (v4) validation.
- **Database & ODM**: MongoDB Atlas (replica set) + Mongoose with multi-document ACID transactions (`session.withTransaction`) & atomic `$expr` capacity locks.
- **Authentication**: JWT with `httpOnly` cookie support + `Authorization: Bearer` header + `bcrypt` (10 rounds).
- **Multi-Tenancy & RBAC**: Scoped `Membership` model per organization (`owner` | `staff`), `requireOrgRole` middleware, and transactional `ownerCount` last-owner protection.
- **Payments & Webhooks**: Razorpay (order creation, HMAC-SHA256 checkout verification, and raw-body signed `WebhookEvent` deduplication).
- **Digital Ticketing**: HMAC-SHA256 signed QR tokens (`base64url`) with strict single-use (`VALID` -> `USED`) gate check-in enforcement.
- **Testing**: Jest + Supertest integration suite (`8` suites / `75` tests) against live MongoDB Atlas.

---

## 📂 Project Structure

```text
ReserveX/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios client + endpoint wrappers
│   │   ├── components/         # AuthShell, Customer cards, Organizer charts/nav, UI kit
│   │   ├── context/            # AuthContext, OrgContext, ThemeContext, ToastContext
│   │   ├── pages/              # Customer (Home, Explore, Detail, Checkout, Wallet) & Organizer Studio
│   │   └── routes/             # Lazy-split AppRoutes.jsx
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/             # db.js, env.js startup validator, razorpay.js
│   │   ├── controllers/        # auth, booking, event, health, org, payment, ticket, ticketType
│   │   ├── jobs/               # expireHolds.job.js (automatic 10m seat release)
│   │   ├── middleware/         # auth, errorHandler, requireOrgRole, rateLimit, validate
│   │   ├── models/             # User, Org, Membership, Event, TicketType, Booking, Payment, Ticket, WebhookEvent
│   │   ├── routes/             # Feature routers
│   │   ├── seeds/              # seedDemo.js (idempotent demo events + INR tiers)
│   │   ├── services/           # Transactional business logic
│   │   └── validators/         # Zod request schemas
│   ├── tests/                  # 8 Jest + Supertest integration test suites (75 tests)
│   └── package.json
├── ARCHITECTURE.md             # Detailed backend engineering notes
├── BACKEND_ARCHITECTURE.md     # API security & deployment notes
├── HOW_IT_WORKS.md             # Plain-English explainer & presentation walkthrough
├── PRODUCT.md                  # Customer & UI specification
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20+ (v24 supported)
- **MongoDB Atlas** replica set URI (required for multi-document ACID transactions)

### 2. Configure Environment Variables
- **Backend (`server/.env`):** copy `server/.env.example` and fill `MONGO_URI`, `JWT_SECRET`, `QR_SIGNING_SECRET`, `CORS_ORIGIN="http://localhost:5173"`, and Razorpay keys.
- **Frontend (`client/.env`):** copy `client/.env.example` and set `VITE_API_BASE_URL="http://localhost:5000/api"` and `VITE_RAZORPAY_KEY_ID`.

### 3. Install, Seed & Run
```bash
# Terminal 1 — Backend API (:5000)
cd server
npm install
npm run seed   # Idempotently populates demo organizer "ReserveX Live" + 6 sample events
npm run dev

# Terminal 2 — Frontend UI (:5173)
cd client
npm install
npm run dev
```

### 4. Run Automated Backend Integration Tests
Runs all `8` test suites (`75` tests) against MongoDB:
```bash
cd server
npm test
```

### 5. Build Frontend Production Bundle
```bash
cd client
npm run build
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
