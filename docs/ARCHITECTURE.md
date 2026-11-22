# System Architecture

## Overview

**SONIC FEST** is engineered as an enterprise-grade, data-driven music festival and live event management platform. Built on the Next.js App Router (React 19, TypeScript), Tailwind CSS, Supabase (Database, Auth, Storage, Row Level Security), and Resend (Transactional Pass Delivery), the application is fully decoupled from customer-specific hardcoding.

This architecture enables a freelance developer or agency to hand off the platform to any client or re-brand it for an entirely different music festival or concert tour without touching frontend source code.

---

## Architecture Flow Diagram

```text
                               +----------------------------------+
                               |         Public Visitors          |
                               +-----------------+----------------+
                                                 |
                                      HTTPS / Next.js Pages
                                                 |
                                                 v
+-----------------------------------------------------------------------------------+
|                            NEXT.JS APP ROUTER RUNTIME                             |
|                                                                                   |
|  Public Edge & SSR Layer:                                                         |
|  - / (Home: Hero, Dynamic Countdown, About, Lineup, Curated Media, CTA)           |
|  - /events & /events/[slug] (Event Tour Dates & Stage Information)                |
|  - /about (Manifesto, Stage Craft, Production Standards, FAQs)                    |
|  - /gallery (Atmosphere & Stage Pyrotechnics Lightbox)                            |
|  - /contact (Inquiries & VIP Logistics)                                           |
|  - /register (Pass Reservation Gateway)                                           |
|                                                                                   |
|  Server API Routes:                     Admin Control Suite:                      |
|  - /api/register (Validation & Email)   - /admin/login (Supabase Sign In / Up)    |
|  - /api/contact (Inquiries Dispatch)    - /admin/reset-password (Recovery)        |
|  - /api/auth/signout (Session Destroy) - /admin/dashboard (Realtime Metrics)     |
|  - /auth/callback (PKCE Exchange)      - /admin/events (Events CRUD)             |
|                                         - /admin/artists (Roster & Stage Order)   |
|                                         - /admin/registrations (Guest Roster/CSV) |
|                                         - /admin/gallery (Media Management)       |
|                                         - /admin/settings (Dynamic Branding)      |
+----------------------+------------------------------------+-----------------------+
                       |                                    |
          Server Supabase Client               Transaction API Call
                       |                                    |
                       v                                    v
          +------------------------+             +--------------------+
          |    SUPABASE BACKEND    |             |       RESEND       |
          |                        |             |                    |
          | - PostgreSQL DB        |             | - Server-Side Send |
          | - Row Level Security   |             | - Dynamic HTML     |
          | - Supabase Storage     |             |   Pass Confirmation|
          | - Supabase Auth (JWT)  |             | - High Deliverable |
          +------------------------+             +---------+----------+
                                                           |
                                                           v
                                                 +--------------------+
                                                 | Guest Inbox (Pass) |
                                                 +--------------------+
```

---

## Data Flow: Pass Registration & Transactional Confirmation

```text
Visitor Submits Registration Form
   │
   ▼
POST /api/register
   │
   ├─► 1. Server-Side Input Validation (Name, Email regex, Phone, Attendees count 1-20)
   │
   ├─► 2. Event Availability & Status Check (Supabase `events.registration_enabled`)
   │
   ├─► 3. Duplicate Submission Protection (Recent timestamp throttling)
   │
   ├─► 4. Insert Record into Supabase `registrations` (Returns UUID reference)
   │
   ├─► 5. Server invokes Resend API with dynamic HTML pass layout:
   │      - Event Name, Date, Time, Venue, Location
   │      - Attendee Name, Guest Count, Reference Code (PASS-XXXXXXXX)
   │      - Official Security & Gate Instructions
   │
   └─► 6. Returns JSON confirmation payload with reference code to frontend
```

---

## Admin Flow & Authentication

```text
Admin accesses /admin/login
   │
   ▼
Supabase Auth (signInWithPassword / signUp)
   │
   ├─► On Success: Session JWT stored in secure HTTP-only cookies
   ├─► Middleware / Client verify active session
   │
   ▼
/admin/dashboard & Control Suite
   │
   ├─► /admin/events       ──► Full CRUD on festival editions & tour dates
   ├─► /admin/artists      ──► Manage headliners, photos, bios, stage allocations
   ├─► /admin/registrations ──► View real-time attendee roster & export CSV
   ├─► /admin/gallery      ──► Add photos, captions, and adjust display orders
   └─► /admin/settings     ──► Dynamically change Festival Name, Logo, Hero,
                               About, Contact Info, Social URLs, and Footer Copy
```

---

## Decoupled Design Principle

1. **Zero Hardcoded Customer Copy:** Every public visual component retrieves values from either Supabase (`site_settings`, `events`, `artists`, `gallery`) or the centralized defaults (`lib/constants/defaults.ts`).
2. **Dynamic Countdown Clock:** The countdown timer dynamically parses the date and start time of the featured event. If the event is in the past, it automatically presents an "EVENT ENDED" notice.
3. **Responsive & Motion Friendly:** All UI elements respect `@media (prefers-reduced-motion: reduce)` to support users with vestibular motion sensitivity.
