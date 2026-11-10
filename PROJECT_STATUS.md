# PROJECT_STATUS.md — ReserveX

Last updated: 2026-11-11

## Summary

ReserveX: a multi-tenant event ticketing platform with concurrency-safe
booking and payment-recovery workflows. Backend first, frontend later.

**Current phase:** Phase 1 — Foundation (auth, central error handling, Zod validation, and rate limiting implemented; role middleware & auth testing next).

## Confirmed decisions

- Plain JavaScript (CommonJS), Node/Express, MongoDB Atlas, Mongoose, React + Vite,
  JWT + bcrypt, Zod, Razorpay test mode, Jest + Supertest.
- General-admission tickets first (capacity counters). No seat maps yet.
- Concurrency-safe booking using MongoDB atomic conditional updates and transactions.
- No PostgreSQL, Prisma, Redis, BullMQ, AI, WebSockets, or TypeScript for now.
- Development order: backend -> API testing -> frontend -> integration -> deployment.

## Roadmap (Phases 1–9)

Immediate MVP milestone target: **November 13, 2026**.

### Phase 1 — Foundation
- [x] Express skeleton (`app.js` / `server.js` separated)
- [x] MongoDB Atlas connected natively via Mongoose (`src/config/db.js`)
- [x] `User` Mongoose model (`src/models/user.model.js`)
- [x] Security headers (`helmet`), `cors` (`credentials: true`), `cookie-parser`
- [x] Health-check endpoint (`GET /health`) + Supertest test (`tests/health.test.js`)
- [x] Central error handler (`AppError`, `error.middleware.js`, 404 catch-all)
- [x] Auth endpoints (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`)
- [x] Auth middleware (`auth.middleware.js` supporting Bearer headers & cookies)
- [x] Zod request validation (`validate.middleware.js`, `auth.validator.js`)
- [x] Auth rate limiting (`rateLimit.middleware.js`)
- [ ] Role-based authorization middleware (`authorize`)
- [ ] Auth flow tested (Postman + Supertest)

### Phase 2 — Organizations
- [ ] `Organization` and `Membership` Mongoose models
- [ ] Organization creation and management endpoints
- [ ] Membership management (`owner` / `staff` permissions)
- [ ] Organization-level data isolation

### Phase 3 — Event Management
- [ ] `Event` Mongoose model
- [ ] Organizer create / update / publish / cancel event endpoints
- [ ] Public event discovery and detail endpoints

### Phase 4 — Ticket Management
- [ ] `TicketType` model (price in integer paise, capacity, `reservedCount`, sales windows)
- [ ] Ticket category creation and management endpoints

### Phase 5 — Booking Engine
- [ ] `Booking` model (`PENDING_PAYMENT`, `CONFIRMED`, `EXPIRED`, `CANCELLED`, `REFUND_PENDING`)
- [ ] Temporary booking holds with expiry timestamps
- [ ] Atomic conditional inventory updates (preventing overselling)
- [ ] Background hold expiry job (`src/jobs/`)
- [ ] Concurrency tests (N parallel requests never exceed capacity)

### Phase 6 — Payments
- [ ] `Payment` and `WebhookEvent` models
- [ ] Razorpay order creation (test mode) & signature verification
- [ ] Idempotent signed webhook handler + payment recovery & reconciliation

### Phase 7 — Digital Ticketing
- [ ] `Ticket` model with signed QR identifiers
- [ ] Check-in validation endpoint (single-use enforcement)

### Phase 8 — Frontend
- [ ] React + Vite + Tailwind + shadcn/ui setup under `/client`
- [ ] Customer discovery, booking checkout, and QR ticket dashboard
- [ ] Organizer dashboard and check-in interface

### Phase 9 — Production Maturity
- [ ] Automated test coverage & GitHub Actions CI
- [ ] Deployment, logging, monitoring, and final README docs

## Completed work

- **Setup & GitHub:** Clean monorepo layout, `.gitignore`, `.env.example`, GitHub remote (`origin/main`) connected and pushed.
- **Foundation & Auth:** Express app with Helmet/CORS/cookie-parser, MongoDB Atlas connection, `User` model, `/health` API + passing test, `AppError` + central `errorHandler`, `RegisterUser` / `loginUser` / `getMe` with `bcrypt` & JWT, Zod validation, and auth rate limiting.

## Session log

| Date | What was done | Next step |
|---|---|---|
| 2026-11-10 / 11 | Connected MongoDB Atlas natively, pushed repo to GitHub, implemented auth (`register`, `login`, `getMe`), central `AppError` + `errorHandler`, Zod validation, and auth rate limiter | Review Zod validation & rate limiting, add role authorization middleware, test auth endpoints, and complete Phase 2 (Organizations) |

## Resume claims checklist (add ONLY after it is built and tested)

- [ ] Concurrency-safe booking (with a passing concurrency test)
- [ ] Signed webhook verification + idempotent processing
- [ ] Reconciliation job
- [ ] Role-based access with organization isolation
- [ ] CI pipeline
- [ ] Live deployment
