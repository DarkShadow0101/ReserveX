# ReserveX 🎟️

ReserveX is a multi-tenant event ticketing and booking platform tailored for small organizers such as college fests, technical clubs, workshops, and hackathons. It is engineered with a primary focus on concurrency-safe bookings, transactional data integrity, and strict multi-tenant isolation.

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
- **Validation**: Zod (v4) schema validation middleware.
- **Security**: Helmet, CORS with credentials, centralized error handling (`AppError`), rate limiting on auth endpoints.
- **Testing**: Jest + Supertest running live integration tests against MongoDB Atlas.

---

## 📂 Project Structure

```text
ReserveX/
├── client/                     # Placeholder for React + Vite frontend
│   └── README.md
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Native Mongoose MongoDB Atlas connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── health.controller.js
│   │   │   ├── organization.controller.js
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
│   │   │   ├── ticketType.model.js       # Ticket tiers, prices in paise, inventory counters
│   │   │   └── user.model.js             # Global user accounts
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── event.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── organization.routes.js
│   │   │   └── ticketType.routes.js
│   │   ├── services/
│   │   │   ├── booking.service.js        # Concurrency-safe holds, cancellations, background expiry
│   │   │   ├── event.service.js          # Event lifecycles, public discovery, organizer updates
│   │   │   ├── organization.service.js   # Org creation, co-owner management, transactional last-owner guard
│   │   │   └── ticketType.service.js     # Ticket tier creation, capacity guardrails
│   │   ├── utils/
│   │   │   └── errors.js                 # Custom operational error class (AppError)
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── booking.validator.js
│   │   │   ├── event.validator.js
│   │   │   ├── organization.validator.js
│   │   │   └── ticketType.validator.js
│   │   ├── app.js              # Express app definition (routes, middleware, error handler)
│   │   └── server.js           # Server bootstrap & background job runner
│   ├── tests/
│   │   ├── auth.test.js        # Auth integration tests
│   │   ├── booking.test.js     # Parallel load concurrency tests & hold expiry tests
│   │   ├── event.test.js       # Event lifecycle & public discovery tests
│   │   ├── health.test.js      # Health check tests
│   │   ├── organization.test.js# Multi-tenancy isolation & race condition tests
│   │   └── ticketType.test.js  # Ticket tier & capacity guardrail tests
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
Ensure `MONGO_URI` is set to your MongoDB Atlas connection string:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/reservex?retryWrites=true&w=majority"
JWT_SECRET="reservex-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
HOLD_TTL_MINUTES=10
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
To run all 53 integration tests live against MongoDB Atlas:
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
| **Tickets**| `GET` | `/api/events/:id/ticket-types` | Public | List active ticket tiers for an event |
| **Tickets**| `POST` | `/api/events/:id/ticket-types` | Owner/Staff | Create ticket tier (price in paise, capacity) |
| **Tickets**| `PATCH`| `/api/ticket-types/:id` | Owner/Staff | Update tier (protected by committed capacity guardrail) |
| **Tickets**| `PATCH`| `/api/ticket-types/:id/toggle` | Owner/Staff | Toggle active status |
| **Bookings**| `POST` | `/api/bookings` | Logged In | Concurrency-safe atomic booking hold |
| **Bookings**| `GET` | `/api/bookings/my` | Logged In | List customer's booking history |
| **Bookings**| `GET` | `/api/bookings/:id` | Customer/Org | Fetch booking detail |
| **Bookings**| `POST` | `/api/bookings/:id/cancel` | Customer | Release hold back to inventory |
| **Bookings**| `GET` | `/api/events/:id/bookings` | Owner/Staff | List all bookings for an event |

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
