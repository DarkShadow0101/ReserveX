# PROJECT_STATUS.md — ReserveX

Last updated: 2026-11-08

## Summary

ReserveX: an event ticketing and booking platform with concurrency-safe
booking and payment-recovery workflows. Backend first, frontend later.

**Current phase:** Milestone 0 complete, Milestone 1 auth & schema implemented.

## Confirmed decisions

- Plain JavaScript, Node/Express, MongoDB Atlas, Mongoose, React + Vite,
  JWT + RBAC, Razorpay test mode, Jest + Supertest.
- General-admission tickets first (capacity counters). No seat maps yet.
- Concurrency-safe booking using MongoDB atomic operations ($inc with conditional query).
- No Redis, queues, AI, WebSockets or TypeScript for now.
- Development order: backend -> database -> API testing -> frontend ->
  integration -> deployment.

## Milestones

Target: demonstrable MVP in roughly 10-12 days (placements run in parallel;
this is a target, not a promise).

### Milestone 0 — Setup (Days 1-2)
- [x] Git repository initialized, commits structured
- [x] `/server` and `/client` folders, `.gitignore`, `.env.example`
- [x] Docker Compose configured with PostgreSQL 16
- [x] Express skeleton (`app.js` / `server.js`, error handler, helmet, cors)
- [x] Health-check endpoint + Supertest test suite passing
- [x] Prisma initialized with schema and client generated
- [x] README with setup steps

### Milestone 1 — Core data and auth (Days 1-2)
- [x] Prisma schema designed and validated
- [ ] Live database migrations applied (`prisma db push` / `migrate dev` once DB is started)
- [x] Register / login / GET /me endpoints
- [x] JWT authentication middleware + role-check middleware (`authorize`, `authorizeOrgRole`)
- [x] Organization & Membership models configured
- [x] Auth validation and route guard tests passing (11/11 tests pass)

### Milestone 2 — Events and tickets (Days 3-4)
- [ ] Organizer: create/update/publish events
- [ ] Ticket types (price, capacity)
- [ ] Public event listing and detail endpoints
- [ ] Authorization tests for organizer endpoints

### Milestone 3 — Booking and concurrency (Days 3-5)
- [ ] Booking hold (temporary reservation with expiry)
- [ ] Capacity enforced in the database (conditional update + constraint)
- [ ] Hold expiry job releases inventory
- [ ] Concurrency test: N parallel requests never exceed capacity
- [ ] Booking state machine enforced

### Milestone 4 — Payments (Days 5-6)
- [ ] Razorpay order creation (test mode)
- [ ] Payment verification endpoint
- [ ] Webhook endpoint with raw-body signature verification
- [ ] Idempotency: event-id dedupe table
- [ ] Payment/booking state transitions driven by webhooks
- [ ] Webhook tests (bad signature, duplicate event, out-of-order event)

### Milestone 5 — Tickets and operations (Days 7-8)
- [ ] QR ticket generation (signed token)
- [ ] Check-in endpoint (a ticket can be used once)
- [ ] Reconciliation job comparing local payments with Razorpay
- [ ] Organizer view of payment exceptions
- [ ] Cancellation and refund flow (basic)

### Milestone 6 — Frontend, deploy, docs (Days 9-12)
- [ ] Plain React UI: browse events, book, view tickets
- [ ] Organizer UI: events, bookings, exceptions
- [ ] CI pipeline (lint + tests) green
- [ ] Deployed backend + frontend, live link
- [ ] README: architecture diagram, invariants, how to run, how it is tested

### Later (only if time and measured need)
- [ ] Redis for holds/caching
- [ ] BullMQ background jobs
- [ ] Reserved seat maps
- [ ] Live availability updates
- [ ] Load test with documented results

## Completed work

- Milestone 0: Monorepo layout, Docker Compose Postgres 16 config, `.gitignore`, `.env.example`, Express skeleton with separated `app.js` and `server.js`, Helmet, CORS, centralized error handling, and health check test.
- Milestone 1: Prisma schema for users, organizations, memberships, events, ticket_types, bookings, payments. Auth endpoints (`/register`, `/login`, `/me`), bcrypt password hashing, JWT signing/verification, RBAC middleware, and 11 automated Supertest tests.

## Current blockers / open questions

- Starting local PostgreSQL container or service to apply live migrations.
- Alignment on role naming: `owner` vs `ORGANIZER_ADMIN`, `staff` vs `ORGANIZER_STAFF`.

## Session log

| Date | What was done | Next step |
|---|---|---|
| 2026-11-08 | Project initialized; Milestone 0 & 1 setup, Express skeleton, Prisma schema, Auth module, and tests passing | Start Postgres, run migrations, align roles with ARCHITECTURE.md |

## Resume claims checklist (add ONLY after it is built and tested)

- [ ] Concurrency-safe booking (with a passing concurrency test)
- [ ] Signed webhook verification + idempotent processing
- [ ] Reconciliation job
- [ ] Role-based access with organization isolation
- [ ] CI pipeline
- [ ] Live deployment
