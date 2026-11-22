# ⚡ SONIC FEST — Premium Music Event Management Platform

> **A production-ready, data-driven music festival and live event management website engineered for freelance reusability and client hand-off.**

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%7C%20Auth%20%7C%20RLS-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Resend](https://img.shields.io/badge/Resend-Transactional%20Emails-black?style=flat&logo=resend)](https://resend.com/)

---

## 🌟 Project Overview

**SONIC FEST** is an immersive, futuristic, high-performance music event management web platform designed to recreate the visceral atmosphere of world-class music festivals.

Featuring dark obsidian aesthetics, electric magenta (`#ff007a`) and deep violet (`#8b5cf6`) lighting accents, glassmorphic surfaces, dynamic countdown clocks, artist line-ups, and an end-to-end pass registration system with transactional email delivery, the application is **100% data-driven**.

### 🚨 Critical Design Principle: Complete Client Reusability
**Zero customer-specific information is hardcoded into frontend components.**
All event names, dates, venues, locations, artists, biographies, ticket details, hero headings, about stories, contact numbers, social links, and logos are dynamically fetched from **Supabase** or central configuration.

A client or developer can completely re-brand the platform for an entirely different festival (e.g. from *"SONIC FEST — Mumbai 2025"* to *"SUMMER BEATS — Delhi 2027"*) directly through the **Admin Control Suite** without touching a single line of frontend code.

---

## 🚀 Key Features

- **Public Festival Portal**:
  - **Full-Screen Immersive Hero**: High-contrast concert imagery, atmospheric lighting gradients, trailer video modal, and dynamic event badge.
  - **Live Dynamic Countdown**: Automatically calculates remaining days, hours, minutes, and seconds to the next scheduled event; switches to `"EVENT ENDED"` when past.
  - **Two-Column Event Story**: Dynamic heading, description, stage visual specs, and experience highlights.
  - **Artist Lineup Showcase**: Filterable by music categories (Headliners, Electronic, Rock), complete with portrait cards and modal biographies.
  - **Multi-Event Tour Dates**: Searchable and filterable schedule of upcoming editions and arena sessions.
  - **Individual Event Pages (`/events/[slug]`)**: Dedicated hero, schedule details, venue specs, confirmed acts, and direct pass booking.
  - **Festival Atmosphere Gallery (`/gallery`)**: High-resolution stage photography with full-screen interactive lightbox and captions.
  - **Pass Registration Gateway (`/register`)**: Instant validation, duplicate protection, reference code generation (`PASS-XXXXXXXX`), and automated transactional pass email via Resend.
  - **Contact & VIP Inquiries (`/contact`)**: Direct form submission and organizer contact metadata.

- **Admin Control Suite (`/admin`)**:
  - **Supabase Authentication**: Secure admin login with session verification and evaluation preview mode.
  - **Real-Time Dashboard (`/admin/dashboard`)**: Metric cards (Total Registrations, Guest Attendees Count, Active Events, Confirmed Artists) and recent registrations roster.
  - **Event Management (`/admin/events`)**: Create, edit, publish/unpublish, toggle registrations, set venue/times/dates, and upload hero images.
  - **Artist Management (`/admin/artists`)**: Add headliners, upload portraits, write bios, and assign performers to festival events.
  - **Registrations Manager (`/admin/registrations`)**: Search attendee records, filter by event edition, and export full rosters to CSV for gate staff.
  - **Gallery Management (`/admin/gallery`)**: Add photos, titles, captions, and adjust display priorities.
  - **Site Settings & Branding (`/admin/settings`)**: Dynamically update Website Name, Logo, Hero Typography, About Narrative, Social Handles, and Footer Copy.

---

## 🧱 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 15 (App Router)** | Server & Client Components, Server-Side Route Handlers, Edge optimization |
| **React 19** | Modern UI primitives, Hooks, concurrent rendering |
| **TypeScript** | Strict type-safety, shared interfaces (`types/database.ts`) |
| **Tailwind CSS** | Custom festival dark theme, neon glows, glassmorphism, responsive utilities |
| **Supabase (PostgreSQL)** | Relational database, Row Level Security (RLS), automated triggers, storage |
| **Supabase Auth** | JWT-based authentication for administrative dashboard access |
| **Resend** | High-deliverability transactional HTML email passes |
| **Lucide React** | Clean, accessible iconography |

---

## 📁 Project Structure

```text
event-website/
├── app/
│   ├── (public)/                 # Public pages layout and views
│   │   ├── page.tsx              # Home (Hero, Countdown, About, Lineup, Gallery, CTA)
│   │   ├── events/               # All Events directory
│   │   │   └── [slug]/           # Single Event details
│   │   ├── about/                # About experience & FAQ
│   │   ├── gallery/              # Festival photography lightbox
│   │   ├── contact/              # Inquiries & VIP form
│   │   └── register/             # Pass booking gateway
│   ├── admin/                    # Authenticated admin suite
│   │   ├── login/                # Admin auth login
│   │   ├── dashboard/            # Metrics & recent passes
│   │   ├── events/               # Events CRUD
│   │   ├── artists/              # Artists curation
│   │   ├── registrations/        # Attendees roster & CSV export
│   │   ├── gallery/              # Photo showcase
│   │   └── settings/             # Dynamic branding & site settings
│   ├── api/
│   │   ├── register/route.ts     # Server validation & Resend pass dispatch
│   │   └── contact/route.ts      # Contact inquiries handler
│   ├── layout.tsx                # Root layout & meta
│   └── globals.css               # Theme variables, glows & motion-reduction
│
├── components/
│   ├── ui/                       # Button, Badge, SectionHeading
│   ├── layout/                   # Navbar, Footer
│   ├── home/                     # Hero, Countdown, AboutSection, ArtistLineup
│   ├── events/                   # EventCard, EventGrid
│   ├── artists/                  # ArtistCard
│   ├── gallery/                  # GalleryGrid
│   ├── registration/             # RegistrationForm
│   └── admin/                    # AdminSidebar, AdminHeader
│
├── lib/
│   ├── supabase/                 # client.ts, server.ts, queries.ts
│   ├── resend/                   # client.ts, templates.ts (HTML pass template)
│   ├── validations/              # registration.ts (input sanitization)
│   ├── constants/                # defaults.ts (centralized fallback data)
│   └── utils/                    # cn.ts, date formatters
│
├── supabase/
│   ├── migrations/               # 001_initial_schema.sql (PostgreSQL DDL, RLS)
│   └── seed.sql                  # Realistic festival seed data
│
├── types/
│   └── database.ts               # Database & entity TypeScript interfaces
│
├── docs/                         # Required architectural documentation
│   ├── ARCHITECTURE.md           # System architecture & ASCII diagrams
│   ├── DATABASE.md               # Schema, relationships, RLS policies
│   ├── DEVELOPMENT.md            # Local dev setup & coding conventions
│   ├── CUSTOMIZATION.md          # Guide for client reusability
│   ├── ENVIRONMENT.md            # Environment variables specification
│   ├── DEPLOYMENT.md             # Cloudflare & Supabase deployment
│   ├── TROUBLESHOOTING.md        # Common diagnostics & fixes
│   └── AI_HANDOFF.md             # Handoff notes for future developers
│
├── .env                          # Local environment file (protected by .gitignore)
├── .gitignore                    # Excludes secrets, node_modules, and builds
├── CHANGELOG.md                  # Semantic version release notes
├── CONTRIBUTING.md               # Contribution and branch workflow
└── SECURITY.md                   # Security policies and RLS overview
```

---

## 🛠️ Prerequisites

- **Node.js**: `v18.18+` or `v20+` or `v22+`
- **npm**: Package manager
- **Supabase Account**: Free project at [supabase.com](https://supabase.com)
- **Resend Account**: Free account at [resend.com](https://resend.com)

---

## 📦 Installation & Quick Start

1. **Clone and navigate to repository**:
   ```bash
   cd "event website"
   ```

2. **Verify Environment Configuration**:
   Ensure that `.env` is present in the project root with the required keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `RESEND_API_KEY`

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Launch Local Server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the public site or [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) for the admin portal.

---

## 🗄️ Supabase Setup & Migrations

1. Open your Supabase Dashboard and go to the **SQL Editor**.
2. Run `supabase/migrations/001_initial_schema.sql`:
   - Creates `events`, `artists`, `event_artists`, `registrations`, `gallery`, and `site_settings`.
   - Enables Row Level Security (RLS) on all tables.
   - Creates the `media` storage bucket for public image hosting.
3. Run `supabase/seed.sql` to populate sample festival tour dates, artists, and default settings.
4. Go to **Authentication -> Providers** and verify that **Email** is enabled.

---

## 📧 Resend Email Integration

When an attendee books passes on `/register`:
1. Server validates data and records the booking in Supabase.
2. Server invokes Resend with `generateRegistrationEmailHtml(...)`.
3. An official confirmation pass email is delivered with the attendee's name, reference code, date, and venue details.

---

## 👑 Admin Setup

1. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Click **"Register new admin user"** to register your first admin account with email and password.
3. For immediate local evaluation without waiting for email verification, click the **"⚡ Quick Preview Mode (Bypass Auth for Evaluation)"** button.

---

## 🏗️ Production Build

Verify that the application compiles with zero TypeScript errors:
```bash
npm run build
```

---

## ☁️ Cloudflare Deployment

1. Push your repository to **GitHub** (with `.env` protected by `.gitignore`).
2. In Cloudflare Dashboard, go to **Pages -> Connect to Git**.
3. Select your repository and configure:
   - **Framework Preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Node.js Compatibility Flag**: Add `nodejs_compat`.
4. In **Settings -> Environment Variables**, add your production keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `RESEND_API_KEY`
5. Deploy and link your custom domain (e.g., `sonicfest.live`).

---

## 🎨 Client Customization Summary

To re-use this project for a new client:
1. Open `/admin/settings` -> update the **Festival Name**, **Logo**, **Hero Title**, and **Contact Info**.
2. Open `/admin/events` -> create the client's events and dates.
3. Open `/admin/artists` -> add the client's performer lineup.
4. Open `/admin/gallery` -> upload stage and crowd photos.

No frontend code modifications required! See [docs/CUSTOMIZATION.md](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/CUSTOMIZATION.md) for full details.

---

## 📄 Documentation Sitemap

- [System Architecture](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/ARCHITECTURE.md)
- [Database & Schema](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/DATABASE.md)
- [Local Development](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/DEVELOPMENT.md)
- [Client Customization](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/CUSTOMIZATION.md)
- [Environment Variables](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/ENVIRONMENT.md)
- [Production Deployment](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/DEPLOYMENT.md)
- [Troubleshooting & Diagnostics](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/TROUBLESHOOTING.md)
- [AI Assistant & Developer Handoff](file:///c:/Users/win11/OneDrive/Desktop/event%20website/docs/AI_HANDOFF.md)
- [Security Policy](file:///c:/Users/win11/OneDrive/Desktop/event%20website/SECURITY.md)
- [Changelog](file:///c:/Users/win11/OneDrive/Desktop/event%20website/CHANGELOG.md)
- [Contributing](file:///c:/Users/win11/OneDrive/Desktop/event%20website/CONTRIBUTING.md)

---

## ⚖️ License

Crafted for freelance and commercial event production.
