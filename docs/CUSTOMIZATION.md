# Freelance Customization & Client Reusability Guide

## 🚨 Critical Principle: Zero Hardcoding

**Customer-specific information must never be hard-coded into reusable components.**

This project is intentionally architected as a high-end, data-driven event platform template. If your client requests a change from:
- **"SONIC FEST"** (Mumbai, August 2025)
to:
- **"SUMMER BEATS"** (New Delhi, January 2027)

you do **NOT** need to edit or recompile frontend source code. All changes can be managed directly via the **Admin Control Suite** or updated in Supabase.

---

## 1. Customizing Website Name & Branding

Navigate to `/admin/settings` or update the `site_settings` table:

1. **Festival / Website Name**: Update `site_name` (e.g. `SUMMER BEATS`).
2. **Brand Logo**: Provide a public image URL in `logo_url`. If empty, the system automatically renders an aesthetic, neon-accented typographical logo split into dual-tone words.
3. **Primary CTA**: Change button text (e.g., "Reserve Passes", "Buy VIP Tickets") and target destination (e.g., `/register` or an external ticketing link).

---

## 2. Customizing Hero & Homepage Story

In `/admin/settings`:
- **Hero Title**: Update the primary uppercase hero banner (e.g., `"THE SOUND OF TOMORROW"`).
- **Hero Subtitle**: Update the tagline (e.g., `"Join 60,000 music enthusiasts under the open sky."`).
- **About Section Title & Narrative**: Update the event manifesto and experience summary.

---

## 3. Managing Events, Tour Dates & Venues

Navigate to `/admin/events`:
- **Add New Event**: Click `+ Create New Event`.
  - Enter the Event Title, Custom URL Slug, Date, Start & End Times, Venue Name, City/Location, and Hero Image URL.
- **Publish / Unpublish**: Toggle public visibility with a single click.
- **Pass Registrations**: Enable or disable pass booking per event date.
- **Dynamic Countdown**: The hero countdown automatically recalculates to the next published event date and time. If the date has passed, it dynamically displays `"EVENT ENDED"`.

---

## 4. Managing Artist Lineup & Stage Acts

Navigate to `/admin/artists`:
- **Add Artist**: Input the performer's name, role (e.g., "Headliner", "Techno Live Act", "Indie Rock"), portrait photograph URL, and biography.
- **Assign to Events**: Assign artists directly to specific festival dates.
- **Category Filter**: Category filters on the public homepage (`#lineup`) automatically populate from the categories present in your database.

---

## 5. Atmosphere Gallery & Media

Navigate to `/admin/gallery`:
- **Add Photos**: Add high-resolution concert photography, laser stage visuals, or crowd moments.
- **Captions & Titles**: Provide rich metadata that appears in the interactive visitor lightbox.
- **Ordering**: Adjust `display_order` to control which images appear in prime positions.

---

## 6. Contact Details & Social Media Links

In `/admin/settings`:
- **Contact Email & Phone**: Changes update both the global footer and the `/contact` inquiries routing.
- **Social Handles**: Update your client's official Instagram, YouTube, Spotify, and X links. If any social link is cleared, its icon is gracefully omitted from the public footer.
- **Footer Text**: Update the copyright notice and branding line.

---

## 7. Customizing Colors & Visual Theme

If a client requires a distinct brand palette (e.g., Electric Gold & Cyan instead of Magenta & Violet), edit `tailwind.config.ts`:

```typescript
colors: {
  background: "#08070e", // Deep void background
  primary: {
    DEFAULT: "#ff007a",  // Swap with client primary accent (e.g. #00f0ff)
    hover: "#e6006e",
    glow: "rgba(255, 0, 122, 0.4)",
  },
  accent: {
    purple: "#8b5cf6",   // Swap with secondary accent
    violet: "#a855f7",
  }
}
```

Rebuilding the app will instantly propagate the new color theme across all glassmorphic components, glowing text, and interactive buttons.
