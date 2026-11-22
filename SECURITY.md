# Security Policy & Safeguards

## 1. Secret & Credential Management
- **Environment Isolation**: All private credentials (such as `RESEND_API_KEY` and Supabase service keys) are kept strictly on the server.
- **Client Bundle Protection**: Only variables explicitly prefixed with `NEXT_PUBLIC_` are bundled into the client runtime.
- **Git Protection**: Local `.env` files are excluded from Git through `.gitignore`. Never hardcode, print, log, or commit secret keys.

---

## 2. Row Level Security (RLS)
The Supabase PostgreSQL database implements Row Level Security across all core tables:
- **Public (Anonymous)**:
  - Read access to published `events`, all `artists`, `event_artists`, `gallery`, and `site_settings`.
  - Write access restricted solely to inserting new `registrations`.
- **Authenticated (Admin)**:
  - Full CRUD permissions on `events`, `artists`, `registrations`, `gallery`, and `site_settings`.
  - Sensitive guest registration information (attendee phone numbers, emails, guest counts) cannot be queried by unauthenticated users.

---

## 3. Input Validation & API Protection
- **Server-Side Validation**: All incoming registration requests in `app/api/register/route.ts` are validated against strict type, length, regex, and count rules (`lib/validations/registration.ts`).
- **Duplicate Protection**: Registration submissions are throttled to prevent spam and accidental multi-submissions.
- **Attendee Caps**: The database schema enforces a check constraint (`attendees > 0 AND attendees <= 20`) to prevent data corruption.

---

## 4. Production Security Recommendations
1. **Custom Email Domain**: In Resend, configure DKIM and SPF records for your custom domain to prevent email spoofing.
2. **Cloudflare WAF**: Place the application behind Cloudflare with Web Application Firewall (WAF) and DDoS protection enabled.
3. **Strong Admin Credentials**: Enforce complex passwords and enable MFA (Multi-Factor Authentication) for Supabase project owners.

---

## 5. Reporting Security Vulnerabilities
If you discover a potential security vulnerability within this project, please report it privately to the security team at `security@sonicfest.live` instead of opening a public issue.
