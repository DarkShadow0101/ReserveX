# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Event Attendees:** Discover live events, reserve ticket holds, complete payment via Razorpay Checkout, and present cryptographically signed QR passes at the venue entrance.
- **Event Organizers:** Create and manage organizations, events, and ticket tiers; monitor bookings; and scan attendee QR tickets at check-in.

## Product Purpose

ReserveX is an end-to-end event ticketing and venue check-in web application. Success means attendees can reliably discover events, hold and pay for tickets without overselling or payment-race errors, and enter venues with verifiable single-use QR passes, while organizers can manage inventory and check-in with confidence.

## Positioning

Atomic, zero-overselling ticket inventory holds paired with idempotent Razorpay payment verification/webhooks and cryptographically signed, single-use QR tickets (`VALID` → `USED`).

## Operating Context

- **Discovery & Booking Flow:** Browse events by location, category, and date → select ticket tiers → create a timed 10-minute hold → pay via Razorpay Checkout → receive confirmed booking and QR tickets in My Tickets.
- **Venue Check-In:** Organizers scan attendee QR codes; each valid ticket transitions once from `VALID` to `USED`, and duplicate scans are rejected.
- **Deployment:** React + Vite SPA on Vercel (`client/`), Express + MongoDB Atlas API on Render (`server/`), with `/health` monitoring.

## Capabilities and Constraints

- **Confirmed Capabilities:** JWT authentication and role-based organizer authorization, atomic hold creation/expiry/cancellation with inventory restoration, Razorpay order creation + HMAC-SHA256 verification + idempotent webhook capture, and single-use QR generation/check-in.
- **Technical Constraints:** Preserve the existing ReserveX brand name, Razorpay checkout and webhook verification flow, and Vercel SPA + Render API architecture.

## Brand Commitments

- **Name:** ReserveX
- **Real-Data-Only Policy:** Never fabricate testimonials, customer logos, attendance metrics, or fake payment/booking states.

## Evidence on Hand

- Production codebase in `client/` and `server/` with automated backend Jest coverage (73 tests across 8 suites) and Vite production build.
- No external testimonials, press quotes, or customer case studies are on hand; future work must not invent them.

## Product Principles

1. **Correctness Before Polish:** Never compromise atomic inventory holds, payment/webhook idempotency, or single-use QR enforcement.
2. **Real Data Only:** Surface only authentic event, ticket, and booking data.
3. **Clarity Under Time Pressure:** Keep checkout timers, payment states, and venue QR check-in feedback unmistakable.
