# Troubleshooting & Diagnostics

## 1. Supabase Connection Issues

### Symptom: Tables return empty or query times out
- **Resolution**:
  1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env`.
  2. Confirm that you ran `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor.
  3. Check Row Level Security: If querying as an anonymous user, ensure the table has `SELECT` permission enabled for `anon` role (e.g. `USING (published = true)`).
  4. The platform includes automatic fallback data in `lib/constants/defaults.ts` so the site continues rendering even during database maintenance.

---

## 2. Authentication & Admin Login Errors

### Symptom: "Invalid login credentials" or cannot sign in
- **Resolution**:
  1. In Supabase Dashboard -> **Authentication -> Users**, check that the admin user exists.
  2. If creating your first admin user, either:
     - Use the "Register new admin user" toggle on `/admin/login`.
     - Or manually invite a user from the Supabase Dashboard.
  3. If testing locally without internet/Supabase credentials, click the **"⚡ Quick Preview Mode (Bypass Auth for Evaluation)"** button on `/admin/login` to inspect the dashboard immediately.

---

## 3. Registration Form Errors

### Symptom: "Selected event was not found or is unavailable"
- **Resolution**:
  - In `/admin/events`, check that the event is created and has `registration_enabled` set to `true`.

### Symptom: "A registration with this email was recently submitted"
- **Resolution**:
  - The API includes duplicate-submission protection within a 5-minute window for the same email and event to prevent accidental double-clicks. Wait 5 minutes or use a different test email.

---

## 4. Resend Email Delivery Warnings

### Symptom: Registration succeeds but email does not arrive
- **Resolution**:
  1. Verify `RESEND_API_KEY` is present in `.env`.
  2. If using the default sender (`onboarding@resend.dev`), Resend's free tier only delivers emails to the **account holder's registered email address**.
  3. To send passes to any public visitor email address, verify your client's custom domain in the Resend dashboard and set `RESEND_FROM_EMAIL=Passes <passes@yourdomain.com>`.

---

## 5. Image & Media Display Issues

### Symptom: Image fails to load or shows broken icon
- **Resolution**:
  1. Check `next.config.ts` to ensure remote image patterns permit the host domain. By default, `next.config.ts` permits all HTTPS remote domains (`protocol: "https", hostname: "**"`).
  2. For Supabase Storage, ensure the bucket (`media`) has public read access enabled.

---

## 6. Build & Compilation Diagnostics

### Symptom: `EPERM: operation not permitted, mkdir` on Windows
- **Resolution**:
  - On Windows with cloud sync (e.g., OneDrive), transient filesystem lockups can occur during webpack cache writes. Rerun `npm run build` or run with elevated permissions.
