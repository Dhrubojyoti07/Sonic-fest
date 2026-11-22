# Production Deployment Guide

## 1. Version Control (GitHub)

1. Verify that `.gitignore` properly protects `.env` and `.next/`.
2. Commit your application code:
   ```bash
   git add .
   git commit -m "feat: complete sonic fest event management platform"
   ```
3. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/your-org/sonic-fest.git
   git push -u origin main
   ```

---

## 2. Supabase Production Setup

1. Create a production Supabase project at [https://supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard:
   - Run `supabase/migrations/001_initial_schema.sql` to generate all tables, constraints, indexes, RLS policies, and storage bucket configuration.
   - Run `supabase/seed.sql` to populate initial site settings, featured events, and lineup acts.
3. In **Authentication -> Providers**, ensure Email/Password authentication is enabled.
4. In **Storage**, ensure the `media` bucket is created and marked public for asset delivery.

---

## 3. Resend Email Configuration

1. Create a free account at [https://resend.com](https://resend.com).
2. Navigate to **Domains**:
   - Add your client's custom domain (e.g., `sonicfest.live`).
   - Add the required DNS records (DKIM, SPF, MX) to your DNS provider (Cloudflare, Namecheap, etc.) to ensure 100% email deliverability.
3. Generate an API Key under **API Keys**.
4. Set `RESEND_API_KEY` in your production environment.

---

## 4. Cloudflare Deployment (Pages or OpenNext)

### Option A: Cloudflare Pages (Recommended)
1. In your Cloudflare Dashboard, navigate to **Compute (Workers) -> Pages -> Connect to Git**.
2. Select your GitHub repository.
3. Configure the build settings:
   - **Framework Preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages` or `npm run build`
   - **Build output directory**: `.vercel/output/static` (for Pages) or `.next`
   - **Node.js Compatibility Flag**: Add `nodejs_compat` to your Pages compatibility flags.
4. In **Settings -> Environment Variables**, add your production variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (Optional verified sender)
5. Click **Deploy**.

---

## 5. Domain Configuration

1. In Cloudflare Pages, navigate to **Custom Domains**.
2. Add your custom apex or subdomain (e.g., `sonicfest.live`, `tickets.sonicfest.live`).
3. Cloudflare will automatically provision SSL/TLS certificates and enable edge CDN caching.

---

## 6. Post-Deployment Verification Checklist

- [ ] Visit homepage: verify Hero, Countdown, About, Lineup, and Gallery load cleanly.
- [ ] Test `/register`: submit a test registration for an event.
- [ ] Check inbox: verify that dynamic HTML confirmation email arrives with accurate reference code.
- [ ] Visit `/admin/login`: sign in with admin credentials.
- [ ] Visit `/admin/dashboard`: verify that your test registration appears in the recent registrations table.
- [ ] Visit `/admin/settings`: test modifying the website name or hero title, save, and check the live homepage to verify dynamic updates.
