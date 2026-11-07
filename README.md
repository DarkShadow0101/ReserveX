# ReserveX 🎟️

ReserveX is an event ticketing platform tailored for small organizers such as college fests, workshops, hackathons, and cultural events.

---

## 🛠️ Locked Architectural Decisions

- **Runtime & Language**: Node.js with Plain JavaScript (CommonJS, no TypeScript).
- **Backend Framework**: Express.js.
- **Frontend**: React + Vite (located under `/client` - milestone 2+).
- **Database & ORM**: PostgreSQL (run via Docker Compose), Prisma ORM for standard CRUD.
- **Transaction Safety**: Booking-critical logic uses raw SQL inside PostgreSQL transactions.
- **Authentication**: JWT (JSON Web Tokens) + `bcrypt` password hashing.
- **Role-Based Access Control (RBAC)**:
  - `ORGANIZER_ADMIN` (full organizer management)
  - `ORGANIZER_STAFF` (event check-in, operations)
  - `CUSTOMER` (event attendee/ticket buyer)
- **Testing**: Jest + Supertest for integration tests.

---

## 📂 Project Structure

```text
ReserveX/
├── client/                     # Placeholder for React + Vite frontend
│   └── README.md
├── server/
│   ├── prisma/
│   │   └── schema.prisma       # Prisma database schema & PostgreSQL models
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # Prisma client singleton instance
│   │   │   └── env.js          # Centralized environment variable loader
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── health.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js        # JWT verify + RBAC (authorize, authorizeOrgRole)
│   │   │   ├── error.middleware.js       # Centralized 4-argument Express error handler
│   │   │   ├── rateLimiter.middleware.js # Express rate limiters for auth
│   │   │   └── validate.middleware.js    # Zod schema validation middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── health.routes.js
│   │   │   └── index.js
│   │   ├── schemas/
│   │   │   └── auth.schema.js            # Zod validation schemas
│   │   ├── services/
│   │   │   └── auth.service.js           # Password hashing, token creation, DB queries
│   │   ├── utils/
│   │   │   ├── errors.js                 # Custom operational error classes (AppError)
│   │   │   └── response.js               # Standardized success/error JSON response helpers
│   │   ├── app.js              # Express app (middleware, routes, error handlers - NO app.listen)
│   │   └── server.js           # HTTP server entry point (app.listen)
│   ├── tests/
│   │   └── health.test.js      # Supertest health-check tests
│   ├── .env.example            # Template for environment variables
│   ├── jest.config.js          # Jest configuration
│   └── package.json
├── docker-compose.yml          # PostgreSQL 16 service with volume persistence
├── .gitignore                  # Git ignore rules (.env, node_modules, etc.)
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher (v24 recommended)
- **Docker & Docker Compose** (or a local PostgreSQL instance)
- **Git**

### 2. Start PostgreSQL Database
From the root directory (`ReserveX/`):
```bash
docker compose up -d
```
This spins up PostgreSQL 16 on port `5432` with database `reservex_dev`.

### 3. Configure Environment Variables
Inside the `server/` directory, copy `.env.example` to `.env`:
```bash
cd server
cp .env.example .env
```
Default connection string:
```env
DATABASE_URL="postgresql://reservex:reservex_secret@localhost:5432/reservex_dev?schema=public"
JWT_SECRET="reservex-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

### 4. Push Database Schema (Prisma)
Generate the Prisma Client and sync the schema with your PostgreSQL database:
```bash
cd server
npm run prisma:generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 6. Run Automated Tests
```bash
npm test
```

---

## 📡 API Reference (Milestone 1)

### Health Check
- **`GET /health`**
  - **Description**: Returns service health, uptime, and timestamp.
  - **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "ReserveX service is healthy",
      "data": {
        "status": "ok",
        "uptimeSeconds": 42,
        "timestamp": "2026-11-08T00:00:00.000Z",
        "environment": "development"
      }
    }
    ```

### Authentication
- **`POST /api/v1/auth/register`**
  - **Rate Limit**: 15 requests / 15 minutes per IP.
  - **Validation**: Zod (`email`, `password` min 8 chars, `fullName` min 2 chars, optional `role`).
  - **Request Body**:
    ```json
    {
      "email": "student@college.edu",
      "password": "strongPassword123",
      "fullName": "Punit Kumar",
      "role": "ORGANIZER_ADMIN"
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "user": {
          "id": "c1f7b025-b461-4fa3-94be-cc0cfce5a18a",
          "email": "student@college.edu",
          "fullName": "Punit Kumar",
          "role": "ORGANIZER_ADMIN",
          "createdAt": "2026-11-08T00:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ```

- **`POST /api/v1/auth/login`**
  - **Rate Limit**: 15 requests / 15 minutes per IP.
  - **Request Body**:
    ```json
    {
      "email": "student@college.edu",
      "password": "strongPassword123"
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "id": "c1f7b025-b461-4fa3-94be-cc0cfce5a18a",
          "email": "student@college.edu",
          "fullName": "Punit Kumar",
          "role": "ORGANIZER_ADMIN"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ```

- **`GET /api/v1/auth/me`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User profile fetched successfully",
      "data": {
        "user": {
          "id": "c1f7b025-b461-4fa3-94be-cc0cfce5a18a",
          "email": "student@college.edu",
          "fullName": "Punit Kumar",
          "role": "ORGANIZER_ADMIN",
          "memberships": []
        }
      }
    }
    ```

---

## 🧠 Key Backend Concepts Explained for Learners

1. **Separation of `app.js` and `server.js`**:
   `app.js` builds the Express instance (middleware + routes). `server.js` calls `app.listen(PORT)`. This separation allows test suites (like Supertest) to simulate requests in memory without opening a live TCP port.
2. **Central Error Handling**:
   Instead of repeating try/catch blocks that manually construct response JSON, controllers pass unhandled errors to `next(err)`. A single 4-argument Express middleware `(err, req, res, next)` converts all errors (Zod validation, Prisma unique constraint errors, JWT expiry) into uniform, safe JSON responses.
3. **Integer Cents/Paise for Pricing**:
   In `TicketType`, price is stored as an integer (`Int @default(0)`). Storing money as floating point numbers (`5.99`) causes rounding errors during arithmetic. Storing 599 cents/paise guarantees exact integer math.
4. **Multi-Tenant Memberships**:
   Users have a single global login. The `Membership` model connects a user to a specific `Organization` (e.g. "Coding Club") with a scoped role (`ORGANIZER_ADMIN` or `ORGANIZER_STAFF`).
