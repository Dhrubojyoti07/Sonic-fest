# Local Development Guide

## Prerequisites

- **Node.js**: `v18.18+` or `v20+` or `v22+` (v22 recommended)
- **Package Manager**: `npm`
- **Supabase Account**: With a project configured or local instance
- **Resend Account**: For testing transactional pass confirmations

---

## Installation & Setup

1. Clone or navigate to the repository directory:
   ```bash
   cd "event website"
   ```

2. Verify that your `.env` configuration file is present in the project root. (Ensure secrets are never shared or committed to Git).

3. Install project dependencies:
   ```bash
   npm install
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your browser to:
   - Public Website: [http://localhost:3000](http://localhost:3000)
   - Admin Control Suite: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## Coding Conventions & Quality Guidelines

### TypeScript
- Maintain strict typing throughout the codebase.
- Reusable entities belong in `types/database.ts`.
- Avoid arbitrary `any` types. Where external vendor APIs return unpredictable payloads, use explicit union types or document why.

### Directory Architecture
- `app/(public)/`: Publicly accessible pages (`page.tsx`, `events/`, `about/`, `gallery/`, `contact/`, `register/`).
- `app/admin/`: Authenticated admin management views (`login/`, `dashboard/`, `events/`, `artists/`, `registrations/`, `gallery/`, `settings/`).
- `app/api/`: Server-side Route Handlers for registrations and inquiries.
- `components/ui/`: Atomic interface primitives (Button, Badge, Card, SectionHeading).
- `components/layout/`: Global structural navigation (Navbar, Footer).
- `lib/supabase/`: Client and server factories, typed queries.
- `lib/resend/`: Transactional email templates and client dispatcher.

### Tailwind Styling & Festival Aesthetic
- Base background: `#08070e` (Near-black / obsidian).
- Electric Magenta: `#ff007a` (Accent, neon glows, badges).
- Electric Purple: `#8b5cf6` (Secondary glow, stage highlights).
- Surfaces: `#0f0d1b`, `#141124`, with subtle glassmorphic borders `border-white/10`.
- Always respect `@media (prefers-reduced-motion: reduce)`.

---

## Production Build Verification

To verify full compile and type-safety locally before deployment:
```bash
npm run build
```
Ensure that all routes compile and prerender cleanly without warnings or errors.
