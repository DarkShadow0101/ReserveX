# ReserveX — Frontend Architecture & Visual Implementation Guide

This document reflects the actual implemented frontend inside `client/` after the complete visual implementation pass across all customer, authentication, and organizer pages.

---

## 1. Actual Folder Structure (`client/src/`)

```text
client/src/
├── api/                         # Domain-grouped Axios API modules
│   ├── client.js                # Shared Axios instance (VITE_API_BASE_URL, credentials, Bearer token interceptor)
│   ├── auth.api.js              # /auth/register, /auth/login, /auth/me
│   ├── organizations.api.js     # /organizations/* (create, list, members, org events)
│   ├── events.api.js            # /events/* (public discovery, manage, update, publish, cancel)
│   ├── ticketTypes.api.js       # /events/:id/ticket-types & /ticket-types/:id/*
│   ├── bookings.api.js          # /bookings/* & /events/:id/bookings
│   ├── payments.api.js          # /payments/create-order & /payments/verify
│   └── tickets.api.js           # /tickets/my, /tickets/:id, /tickets/checkin, /events/:id/tickets
├── components/
│   ├── common/
│   │   ├── Footer.jsx           # Continuous dark footer (#060911) with links & honest updates notice
│   │   ├── Logo.jsx             # ReserveX brand mark
│   │   └── Navbar.jsx           # Responsive header (transparent over hero, dark glass on scroll)
│   ├── customer/
│   │   ├── CategoryCard.jsx     # Photographic category tile with icon badge & fallback image
│   │   ├── EventCard.jsx        # Multi-variant event card (dark-spotlight, dark-compact, dark-grid, default)
│   │   └── SearchFilterBar.jsx  # Search bar with pill, editorial, and dark-glass variants
│   ├── organizer/
│   │   ├── KPICard.jsx          # Organizer KPI summary card
│   │   ├── RevenueChart.jsx     # Recharts AreaChart (with empty state when 0 confirmed revenue)
│   │   ├── Sidebar.jsx          # Dark navy organizer sidebar + organization switcher & creation modal
│   │   ├── TicketSalesDonut.jsx # Recharts PieChart donut (with empty state when 0 tickets sold)
│   │   └── Topbar.jsx           # Organizer search, notifications, and profile dropdown
│   └── ui/                      # Shared reusable primitives (support theme="light" | "dark")
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Input.jsx
│       ├── LoadingSpinner.jsx
│       └── Modal.jsx
├── context/
│   ├── AuthContext.jsx          # Authentication state, session restoration via /auth/me, login/register/logout
│   └── OrgContext.jsx           # Active organization state, org switching, owner/staff role flags
├── hooks/
│   ├── useCountdown.js          # Server-timestamp countdown timer for 10-minute booking holds
│   └── useDebounce.js           # Input debounce hook
├── layouts/
│   ├── CustomerLayout.jsx       # Continuous #0B0F19 dark canvas wrapper with Navbar & Footer
│   └── OrganizerLayout.jsx      # Dark sidebar + light workspace wrapper + org onboarding gate
├── mocks/
│   ├── demoData.js              # Isolated sample metrics used strictly in Demo Preview mode
│   └── eventImages.js           # Verified HTTP 200 Unsplash imagery & deterministic fallback mapper
├── pages/
│   ├── auth/
│   │   ├── Login.jsx            # Dark-themed login with password visibility & redirect support
│   │   └── Register.jsx         # Dark-themed registration with validation & redirect support
│   ├── customer/
│   │   ├── Home.jsx             # Continuous dark cinematic homepage
│   │   ├── EventsExplore.jsx    # Search, location, category, and sorting discovery page
│   │   ├── EventDetail.jsx      # Event cover, organizer info, and ticket tier selection panel
│   │   ├── Checkout.jsx         # 3-step checkout, hold timer, Razorpay order & verification
│   │   ├── MyBookings.jsx       # Customer booking history & resume payment actions
│   │   └── MyTickets.jsx        # Customer digital QR ticket wallet & gate pass modal
│   └── organizer/
│       ├── Dashboard.jsx        # Real aggregated metrics (with explicit Demo Preview mode when 0 events)
│       ├── EventsManage.jsx     # Organization event table with status filters
│       ├── CreateEvent.jsx      # Draft event creation form
│       ├── EventDetailManage.jsx# Edit/publish/cancel event + ticket tier inventory management
│       ├── BookingsManage.jsx   # Event-scoped booking table
│       ├── TicketsManage.jsx    # Event-scoped issued digital tickets table
│       ├── CheckInScanner.jsx   # Camera QR scanner (html5-qrcode) + manual token fallback
│       ├── TeamManage.jsx       # Owner/staff membership table & invite/remove controls
│       └── OrgSettings.jsx      # Active organization metadata & tenant info
├── routes/
│   └── AppRoutes.jsx            # Client-side route mapping
├── utils/
│   ├── currency.js              # Integer paise to INR formatting (₹)
│   ├── date.js                  # Safe date parsing, badges, and countdown formatting
│   └── errors.js                # API error message extraction
├── App.jsx
├── index.css
└── main.jsx
```

---

## 2. React Concepts, State & Context Architecture

- **Context API (`AuthContext` & `OrgContext`):**
  - `AuthContext` wraps the router, restores sessions on mount via `GET /api/auth/me` (supporting both HTTP-only cookies and `Bearer` token fallback), and exposes `login`, `register`, `logout`, `isAuthenticated`, and `isOrganizer`.
  - `OrgContext` listens to `AuthContext.user`, loads `GET /api/organizations/me`, persists the active organization ID in `localStorage`, and exposes `activeOrg`, `activeOrgId`, `userRole`, `isOwner`, `isStaff`, `switchOrganization`, and `createOrganization`.
- **Custom Hooks:**
  - `useCountdown(holdExpiresAt)` computes remaining seconds from the authoritative server timestamp every second and flags `isExpired` when it reaches `0`.
- **Component Composition & Variants:**
  - Shared UI primitives (`Input`, `Modal`, `Badge`, `LoadingSpinner`) accept `theme="dark" | "light"` so the dark customer marketplace and light organizer workspace share one primitive set without code duplication.
  - `EventCard` supports `dark-spotlight`, `dark-compact`, `dark-grid`, and `default`; `SearchFilterBar` supports `dark-glass`, `editorial`, and `pill`.

---

## 3. API Integration & User Workflows

### Customer Booking Workflow
1. **Discovery (`Home.jsx` / `EventsExplore.jsx`):** Fetches published events via `GET /api/events` (`eventsApi.getPublicEvents`), applies client-side location/category/sort controls, and links to `/events/:id`.
2. **Tier Selection (`EventDetail.jsx`):** Loads `GET /api/events/:id` and `GET /api/events/:id/ticket-types` in parallel, displays `availableCapacity`, formats prices from integer paise (`formatPaiseToINR`), and posts `{ eventId, items }` to `POST /api/bookings`.
3. **Hold & Checkout (`Checkout.jsx`):** Loads `GET /api/bookings/:id`, starts live `useCountdown(booking.holdExpiresAt)`, supports cancelling via `POST /api/bookings/:id/cancel`, creates a Razorpay order via `POST /api/payments/create-order`, and verifies payment via `POST /api/payments/verify` (or test-mode verification fallback when local placeholder keys are active).
4. **Digital Wallet (`MyTickets.jsx` & `MyBookings.jsx`):** Fetches `GET /api/tickets/my` and `GET /api/bookings/my`, rendering each backend-signed `qrToken` via `QRCodeSVG`.

### Organizer Workflow
1. **Onboarding & Org Switching (`OrganizerLayout.jsx`, `Sidebar.jsx`):** Redirects unauthenticated users to `/login?redirect=/organizer`; prompts users with 0 organizations to create one via `POST /api/organizations`.
2. **Analytics (`Dashboard.jsx`):** Loads `GET /api/organizations/:id/events` and aggregates real bookings across organization events via `GET /api/events/:id/bookings`. When an organization has 0 events, explicitly enters Demo Preview mode; when real events exist, displays real metrics (never substituting fake revenue or ticket counts for `0`).
3. **Event & Tier Lifecycle (`EventsManage.jsx`, `CreateEvent.jsx`, `EventDetailManage.jsx`):** Creates draft events, configures ticket tiers in paise (`Math.round(rupees * 100)`), toggles tier active states, and transitions events to `published` or `cancelled`.
4. **Gate Check-In (`CheckInScanner.jsx`):** Scans passes with `Html5QrcodeScanner` (`html5-qrcode`) or manual token submission to `POST /api/tickets/checkin`, distinguishing admitted passes (`200`), duplicate scans (`409`), and invalid tokens.

---

## 4. Design System Decisions

- **Customer Marketplace:** Continuous deep navy (`#0B0F19`) canvas with secondary glass surfaces (`#12172A` / `#1A1F2E`), indigo (`#5B4CF2`) primary actions, restrained coral (`#FF5A5F`) accents, Playfair Display editorial headings, and Inter UI typography. Zero white/cream section breaks.
- **Organizer Portal:** Dark navy vertical sidebar (`#0E1322`) paired with a clean light cool-grey workspace (`#F8FAFC`) and white data cards for high-density operational readability.

---

## 5. Files Modified in This Complete Pass

- `client/src/components/ui/Input.jsx`, `Modal.jsx`, `Badge.jsx`, `LoadingSpinner.jsx`
- `client/src/layouts/CustomerLayout.jsx`, `OrganizerLayout.jsx`
- `client/src/components/customer/EventCard.jsx`
- `client/src/pages/customer/EventsExplore.jsx`, `EventDetail.jsx`, `Checkout.jsx`, `MyBookings.jsx`, `MyTickets.jsx`
- `client/src/pages/auth/Login.jsx`, `Register.jsx`
- `client/src/components/organizer/RevenueChart.jsx`, `TicketSalesDonut.jsx`
- `client/src/pages/organizer/Dashboard.jsx`, `CreateEvent.jsx`, `EventsManage.jsx`
- `FRONTEND_REVISION.md`, `PROJECT_STATUS.md`

---

## 6. Known Limitations & Remaining Work

1. **Live Backend & Payment Verification:** Live end-to-end checkout against MongoDB Atlas and Razorpay test keys requires running `server/` with valid `.env` credentials (`MONGO_URI`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`). Without external Razorpay keys, checkout exercises the backend's local test verification path.
2. **Backend Event Image & Category Fields:** The Mongoose `Event` schema does not store `imageUrl` or `category`; `eventImages.js` maps verified Unsplash imagery and `EventsExplore.jsx` filters categories against title/description text.
3. **Newsletter Endpoint:** No backend newsletter subscription endpoint exists; the footer form displays an informational notice rather than faking a successful subscription.
4. **Dedicated Mobile Polish:** Deferred to a separate pass as scoped.
