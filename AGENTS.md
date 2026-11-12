# AGENTS.md — Permanent Instructions for ReserveX

These rules apply to every task in this repository. Read this file and
`ARCHITECTURE.md` and `PROJECT_STATUS.md` before starting any work.

## 1. Project

ReserveX is an event ticketing and booking platform for small organizers
(college fests, workshops, small events). Its two differentiators:

1. No double booking or overselling under concurrent requests.
2. Reliable payment recovery: signed webhooks, idempotency, a booking state
   machine and a reconciliation job.

The developer is a B.Tech student targeting 2027 campus placements and is
learning backend engineering. The goal is a flagship portfolio project they
can fully explain in interviews. Understanding matters more than speed.

## 2. Locked technology decisions (do not change without asking)

- Language: plain JavaScript. NO TypeScript.
- Backend: Node.js + Express (REST API).
- Database: MongoDB Atlas.
- ODM: Mongoose (atomic operations and transactions for booking-critical logic).
- Auth: JWT + bcrypt, role-based access control.
- Validation: Zod.
- Testing: Jest + Supertest. API checks with Postman.
- Frontend: React + Vite, plain styling (built AFTER the backend works).
- Payments: Razorpay in TEST mode only.
- Tooling: Git + GitHub, GitHub Actions for CI.

## 3. Out of scope for now (do not add unless explicitly asked)

Redis, BullMQ or any queue, WebSockets/Socket.IO, AI or agentic features,
microservices, seat maps, TypeScript, Supabase Auth, GraphQL.
These may be added later, only when a measured need is shown.

## 4. How to work with the developer

- Work in small steps. Before writing code, show a short plan and WAIT for
  approval when the task touches the schema, auth, or booking logic.
- Explain WHY briefly for each design choice. Mark assumptions clearly and
  distinguish them from confirmed requirements.
- Do NOT write the booking transaction, hold/expiry logic, or webhook handler
  unless explicitly asked. The developer implements these themselves; you
  review and explain.
- Make small, logical commits with clear messages (one concern per commit).
- Never add a feature, dependency or file that was not requested. If you see
  an improvement, suggest it instead of doing it.
- Never claim something works unless you ran it. Report test results honestly.
- Never invent metrics, benchmarks or results for the README or resume.

## 5. Code standards

- Keep layers separate: route -> middleware -> controller -> service ->
  database. Business logic lives in services, not controllers.
- `app.js` (builds the Express app) and `server.js` (starts listening) must be
  separate files so tests can import the app.
- Central error handler with consistent JSON error responses. Do not leak
  stack traces or internals in production responses.
- Validate every request body, query and param with Zod.
- Use async/await. No unhandled promise rejections.
- Small functions, clear names, comments only where the WHY is not obvious.

## 6. Security rules (non-negotiable)

- Never commit secrets. `.env` is git-ignored; keep `.env.example` updated.
- Never return password hashes in any API response or log.
- The organization ID and user ID come from the authenticated JWT/session,
  NEVER from client-supplied input.
- Every route must check authorization (role AND ownership/organization),
  not just "is logged in".
- Razorpay webhooks: verify the signature (HMAC-SHA256) over the RAW request
  body before parsing. Reject invalid signatures.
- Webhook handling must be idempotent (dedupe by event id inside a
  transaction). Retries and out-of-order events are normal.
- Apply rate limiting on auth routes. Use helmet and a restrictive CORS config.
- Do not log secrets, tokens, or full payment payloads.

## 7. Data integrity rules

- Prevent overselling in the database itself, not only in application code.
  Use conditional updates and constraints as the final guard.
- Every status change goes through the defined state machine
  (see ARCHITECTURE.md). Illegal transitions must be rejected.
- Money is stored as integers in the smallest unit (paise), never floats.
- Use transactions for any multi-step write that must succeed or fail together.

## 8. Testing rules

- Every feature ships with tests. Priorities:
  1. Concurrency: N parallel booking requests never exceed capacity.
  2. Auth and role checks, including cross-organization access attempts.
  3. State machine: illegal transitions are rejected.
  4. Webhook: invalid signature rejected, duplicate event processed once.
- Tests must run against a real MongoDB Atlas replica set instance (test database), not mocks,
  for anything involving transactions or constraints.
- CI must run lint and tests on every push.

## 9. Git workflow

- `main` stays working. Use short-lived feature branches and pull requests
  where practical.
- Commit message format: `type: short summary` (feat, fix, test, docs,
  refactor, chore).
- Update `PROJECT_STATUS.md` at the end of every work session.

## 10. Definition of done for any task

1. Code runs locally and tests pass (state which ones you ran).
2. Authorization and validation are in place.
3. `ARCHITECTURE.md` is updated if the schema, API or a design decision
   changed.
4. `PROJECT_STATUS.md` is updated.
5. The developer can explain the change in their own words.
