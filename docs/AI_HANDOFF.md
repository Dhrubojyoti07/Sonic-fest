# AI Coding Assistant & Developer Handoff

## 1. Project Purpose & Core Philosophy
**SONIC FEST** is an enterprise-quality, reusable music event management platform designed for freelance and client handover.

### Primary Rule
**ALL CONTENT IS DATA-DRIVEN.** Do NOT hard-code customer-specific names, dates, venues, or artist lists into components. All content originates in Supabase (`site_settings`, `events`, `artists`, `gallery`, `registrations`) with centralized fallback defaults in `lib/constants/defaults.ts`.

---

## 2. Tech Stack Overview
- **Framework**: Next.js 15+ (App Router, Server & Client Components)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Obsidian/Void `#08070e`, Electric Magenta `#ff007a`, Electric Violet `#8b5cf6`, Glassmorphism)
- **Database & Auth**: Supabase (@supabase/ssr, @supabase/supabase-js, PostgreSQL, RLS)
- **Email**: Resend (Server-side HTML transactional pass generation)
- **Icons**: Lucide React
- **Deployment**: Ready for Cloudflare Pages / Vercel

---

## 3. Important Folder Structure
```text
├── app/
│   ├── (public)/          # Public visitor pages (layout, home, events, about, gallery, contact, register)
│   ├── admin/             # Authenticated admin management suite (login, dashboard, events, artists, etc.)
│   ├── api/               # Server-side Route Handlers (/api/register, /api/contact)
│   └── globals.css        # Dark theme, glassmorphism, glowing text, motion reduction
├── components/
│   ├── ui/                # Base primitives: Button, Badge, SectionHeading
│   ├── layout/            # Navbar, Footer (both read from dynamic settings)
│   ├── home/              # Hero, Countdown, AboutSection, ArtistLineup
│   ├── events/            # EventCard, EventGrid
│   ├── artists/           # ArtistCard (with modal bio)
│   ├── gallery/           # GalleryGrid (with lightbox)
│   ├── registration/      # RegistrationForm
│   └── admin/             # AdminSidebar, AdminHeader
├── lib/
│   ├── supabase/          # client.ts, server.ts, queries.ts
│   ├── resend/            # client.ts, templates.ts (dynamic festival pass HTML)
│   ├── validations/       # registration.ts (input sanitization)
│   ├── constants/         # defaults.ts (centralized fallback data)
│   └── utils/             # cn.ts, date formatters
├── types/
│   └── database.ts        # Typed interfaces: Event, Artist, Registration, SiteSettings
├── supabase/
│   ├── migrations/        # 001_initial_schema.sql (Postgres DDL, RLS, storage)
│   └── seed.sql           # Realistic demonstration seed data
```

---

## 4. Key Architectural Decisions
1. **Separation of Concerns**: UI components (`components/`) do not make direct database mutations; data fetching is centralized in `lib/supabase/queries.ts` or handled via Server Route Handlers (`app/api/`).
2. **Resend Server-Side Isolation**: Resend is only invoked in Route Handlers (`app/api/register/route.ts`). The `RESEND_API_KEY` is never exposed to the client bundle.
3. **Graceful Fallbacks**: If Supabase credentials are missing or the database is unseeded during local preview, the site renders high-fidelity fallback data rather than crashing.
4. **Accessible Micro-Interactions**: Custom CSS respects `prefers-reduced-motion: reduce`. Focus rings are keyboard-accessible.

---

## 5. Things That Should NOT Be Changed Casually
- **Environment Keys**: Preserve `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `RESEND_API_KEY`. Do not rename these keys.
- **`.gitignore` Rules**: Ensure `.env` is never un-ignored or committed.
- **Registration Table Constraints**: `attendees` check constraint enforces `1 <= attendees <= 20` at the database level.
- **Slug Uniqueness**: The `events.slug` column has a unique index. Do not remove the unique constraint.
