# Environment Variables Reference

> **Security Notice**: This project uses a protected `.env` file that is strictly excluded from version control via `.gitignore`. Never log, print, commit, or expose secret keys in documentation or client source code.

---

## Configuration Variables

### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Type**: Public
- **Origin**: Supabase Project Dashboard (`Project Settings -> API -> Project URL`)
- **Purpose**: Specifies the base HTTPS URL of your Supabase project instance.
- **Used In**:
  - Browser Client (`lib/supabase/client.ts`)
  - Server Client (`lib/supabase/server.ts`)
  - Query Handlers (`lib/supabase/queries.ts`)

---

### 2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Type**: Public (Safe for browser client)
- **Origin**: Supabase Project Dashboard (`Project Settings -> API -> Project API Keys -> anon / public / publishable`)
- **Purpose**: Authenticates client-side and server-side read/write operations subject to Row Level Security (RLS) policies.
- **Used In**:
  - Browser Client (`lib/supabase/client.ts`)
  - Server Client (`lib/supabase/server.ts`)

---

### 3. `RESEND_API_KEY`
- **Type**: **Secret** (Strictly Server-Side Only)
- **Origin**: Resend Dashboard (`API Keys -> Create API Key`)
- **Purpose**: Authenticates the server-side transactional email service to dispatch HTML registration pass confirmations.
- **Used In**:
  - Server Client (`lib/resend/client.ts`)
  - Registration Route Handler (`app/api/register/route.ts`)
  - Inquiries Route Handler (`app/api/contact/route.ts`)

---

### 4. `RESEND_FROM_EMAIL` (Optional)
- **Type**: Public / Configuration
- **Origin**: Verified domain in Resend Dashboard (e.g., `Sonic Fest <passes@yourdomain.com>`)
- **Default**: `Sonic Fest <onboarding@resend.dev>` (Free sandbox sender)
- **Purpose**: Defines the sender name and email address appearing in attendee pass emails.
- **Used In**:
  - Registration Route Handler (`app/api/register/route.ts`)

---

### 5. `NEXT_PUBLIC_SITE_URL` (Optional)
- **Type**: Public
- **Origin**: Deployment URL (e.g., `https://sonicfest.live` or `http://localhost:3000`)
- **Purpose**: Used for dynamic absolute OpenGraph metadata, pass verification links, and Supabase redirect URLs.
