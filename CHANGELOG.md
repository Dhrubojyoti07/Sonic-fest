# Changelog

All notable changes to the SONIC FEST event management platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-22

### Added
- Initial project setup with Next.js 15, App Router, TypeScript, and Tailwind CSS.
- Public high-energy festival website with dark obsidian surfaces, electric magenta (#ff007a) and deep purple accents.
- Reusable, dynamic navigation bar with responsive mobile menu drawer.
- Dynamic full-screen Hero section with atmosphere gradients, trailer modal, and dynamic metadata.
- Live countdown timer calculating days, hours, minutes, and seconds from database event timestamp with automatic "EVENT ENDED" state.
- Dynamic Two-Column "About the Event" story section with feature highlights.
- Artist Lineup section with category filters and interactive biography modal.
- Multi-event listing page with search, category filters, and detailed view at `/events/[slug]`.
- Event details page with venue specs, assigned performers, and pass booking CTA.
- Curated festival atmosphere photo gallery with full-screen lightbox modal.
- Public contact and VIP inquiries form with server-side email dispatch.
- Pass registration system with input validation, duplicate protection, and database persistence in Supabase.
- Transactional pass confirmation emails powered by Resend with dynamic festival pass layout.
- Authenticated Admin Control Suite powered by Supabase Auth:
  - `/admin/login` (Authentication with demo evaluation mode)
  - `/admin/dashboard` (Realtime metrics, attendee counts, and quick shortcuts)
  - `/admin/events` (Full CRUD, publishing toggles, and pass availability)
  - `/admin/artists` (Lineup curation, photos, bios, and event allocation)
  - `/admin/registrations` (Attendee search, filtering, and CSV export for gate staff)
  - `/admin/gallery` (Photo showcase management with display ordering)
  - `/admin/settings` (Dynamic global branding, hero typography, contact info, and social links)
- Supabase PostgreSQL schema migration with Row Level Security (RLS) policies and Storage bucket setup.
- Comprehensive technical documentation suite (`ARCHITECTURE.md`, `DATABASE.md`, `DEVELOPMENT.md`, `CUSTOMIZATION.md`, `ENVIRONMENT.md`, `DEPLOYMENT.md`, `TROUBLESHOOTING.md`, `AI_HANDOFF.md`, `SECURITY.md`, `CONTRIBUTING.md`).
