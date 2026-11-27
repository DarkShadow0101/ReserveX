# ReserveX Backend Architecture & Production Guide

A study-friendly guide to how the ReserveX Express + MongoDB backend is structured and which production engineering patterns it implements.

---

## 1. Layered Request Lifecycle

Every request moves through clean, single-responsibility layers inside `server/src/`:

```text
HTTP Request
  │
  ▼
server/src/app.js                ──▶ Trust proxy, Helmet headers, CORS origin check, JSON size limit (100kb), /api rate limiter
  │
  ▼
server/src/routes/*.routes.js    ──▶ Route matching + endpoint limiters (authLimiter, bookingLimiter) + authMiddleware + requireOrgRole
  │
  ▼
server/src/middleware/validate.middleware.js  ──▶ Zod schema validation (sanitizes req.body / req.params / req.query)
  │
  ▼
server/src/controllers/*.controller.js        ──▶ Extracts HTTP request params/user, calls service, sends HTTP JSON response
  │
  ▼
server/src/services/*.service.js              ──▶ Pure business logic, MongoDB transactions, HMAC crypto, Razorpay calls
  │
  ▼
server/src/models/*.model.js                  ──▶ Mongoose schemas, unique constraints, indexes
  │
  ▼
server/src/middleware/error.middleware.js     ──▶ Central error translator (CastError, 11000, ValidationError, JWT, ZodError, AppError)
```

**Why this separation helps you learn & scale:**
- **Controllers stay thin:** They never write MongoDB queries directly; they pass validated inputs to services.
- **Services are framework-agnostic:** Core business logic (holds, payments, QR tickets) can be invoked by HTTP controllers OR background cron jobs (`jobs/expireHolds.job.js`).
- **Central error handling:** Throwing `new AppError('...', statusCode)` anywhere routes straight to `error.middleware.js`, which strips internal stack details whenever `NODE_ENV=production`.

---

## 2. Startup, Health Monitoring & Graceful Shutdown

- **Fail-Fast Config (`server/src/config/env.js`):** Validates critical variables (`MONGO_URI`, `JWT_SECRET`, `QR_SIGNING_SECRET`) before booting so missing secrets fail immediately rather than mid-checkout.
- **Database-First Listen (`server/src/server.js`):** Awaits `connectDB()` before calling `app.listen(PORT)` and starts `startHoldCleanupJob(60000)`.
- **Zero-Downtime Shutdown (`SIGTERM` / `SIGINT`):** When Render restarts or redeploys a dyno, `shutdown()` stops the background `setInterval` hold cleanup timer, drains in-flight HTTP requests via `server.close()`, and cleanly closes the MongoDB connection.
- **Readiness Endpoint (`server/src/controllers/health.controller.js`):** `GET /health` reports `database` connection status and `uptimeSeconds`, returning HTTP `503` if MongoDB disconnects in production so UptimeRobot or Render catches degraded state.

---

## 3. Core Engineering Patterns Used

### A. Zero-Overselling Inventory Holds (`server/src/services/booking.service.js`)
Inside `createBookingHold`:
1. Starts a MongoDB transaction (`session.withTransaction(...)`).
2. Executes an **atomic conditional update** (`TicketType.findOneAndUpdate`) with `$expr`:
   ```js
   totalCapacity - (reservedCount + soldCount) >= item.quantity
   ```
   Even if 100 attendees request the last ticket simultaneously, MongoDB's document write lock lets only one increment succeed and rejects the rest cleanly.
3. Snapshots ticket names/prices inside a `PENDING_PAYMENT` `Booking` document with a `10`-minute (`HOLD_TTL_MINUTES`) expiry timestamp (`holdExpiresAt`).
4. Every 60 seconds, `expireHolds.job.js` calls `cleanupExpiredHolds()` to atomically transition overdue holds to `EXPIRED` and decrement `reservedCount` back to available inventory.

### B. Race-Safe Dual Payment Capture (`server/src/services/payment.service.js`)
Payments can confirm through **two concurrent paths**:
1. **Customer Browser Callback:** `POST /api/payments/verify` verifies `razorpay_order_id + '|' + razorpay_payment_id` with HMAC-SHA256 (`RAZORPAY_KEY_SECRET`), validates booking ownership, and runs `confirmBookingPayment`.
2. **Razorpay Server Webhook:** `POST /api/payments/webhook` verifies `req.rawBody` against `x-razorpay-signature` (`RAZORPAY_WEBHOOK_SECRET`), records deduplication state in `WebhookEvent`, and runs transactional capture.

**How races & duplicate tickets are prevented:**
- Both paths run inside `session.withTransaction(...)` and recover gracefully from MongoDB `TransientTransactionError` / `WriteConflict` (`code === 112` or `11000`) by re-checking whether the payment reached `CAPTURED` and booking reached `CONFIRMED`.
- Inside `ticket.service.js`, `generateTicketsForBooking` queries `Ticket.find({ booking: booking._id })` inside the transaction session and returns existing tickets if already issued—guaranteeing **zero duplicate tickets**.

### C. Cryptographically Signed Single-Use QR Entry (`server/src/services/ticket.service.js`)
- `generateSignedQrToken` encodes ticket metadata and signs it with HMAC-SHA256 (`QR_SIGNING_SECRET`) so QR tokens cannot be forged offline.
- `checkInTicket` verifies the HMAC signature, checks organizer membership authorization via `Membership`, transitions `VALID` → `USED` atomically, and rejects any repeat scan with HTTP `409`.

---

## 4. Production Security Checklist

| Layer | Implementation | Where |
|---|---|---|
| Reverse proxy IP resolution | `app.set('trust proxy', 1)` | `server/src/app.js` |
| Security HTTP headers | `helmet()` + `app.disable('x-powered-by')` | `server/src/app.js` |
| Strict multi-origin CORS | Normalized origin whitelist + `credentials: true` | `server/src/app.js` |
| Payload size & ReDoS protection | `100kb` JSON limit + `escapeRegex` search input | `server/src/app.js`, `server/src/services/event.service.js` |
| Tiered rate limiting | `authLimiter` (auth), `bookingLimiter` (holds/orders), `apiLimiter` (`/api`, webhook-exempt) | `server/src/middleware/rateLimit.middleware.js` |
| Password & session hygiene | `bcrypt` hashing, `httpOnly` + `SameSite`/`Secure` production cookies, `/api/auth/logout` | `server/src/controllers/auth.controller.js` |
| Tenant & RBAC isolation | JWT check (`authMiddleware`) + org membership role check (`requireOrgRole`) | `server/src/middleware/auth.middleware.js`, `org.middleware.js` |
| Schema validation | Strict Zod schemas on body/params/query before controllers execute | `server/src/middleware/validate.middleware.js` |

---

## 5. Folder Study Order (Suggested Path to Master the Backend)

1. `server/src/server.js` & `server/src/app.js` — Boot order, middleware stack, shutdown.
2. `server/src/config/env.js` & `server/src/config/db.js` — Config safety & database connection.
3. `server/src/middleware/` (`auth`, `org`, `validate`, `rateLimit`, `error`) — Request guards.
4. `server/src/models/` — MongoDB document structure & relational references.
5. `server/src/services/booking.service.js` -> `payment.service.js` -> `ticket.service.js` — Core transactional ticketing engine.
6. `server/tests/*.test.js` — Real integration tests against MongoDB covering concurrency, webhook races, and security rules.
