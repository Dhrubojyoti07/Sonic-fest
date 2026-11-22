# Database Architecture & Schema

## Overview

The database is built on PostgreSQL hosted via **Supabase**. It implements relational integrity, automated timestamp updates, specialized indexes for query efficiency, and strict Row Level Security (RLS) policies protecting visitor registrations and admin control operations.

---

## Entity Relationship Diagram

```text
  +-------------------------+             +-------------------------+
  |      site_settings      |             |         gallery         |
  +-------------------------+             +-------------------------+
  | id (PK)                 |             | id (PK)                 |
  | site_name               |             | image_url               |
  | logo_url                |             | title                   |
  | hero_title              |             | caption                 |
  | hero_subtitle           |             | display_order           |
  | about_title             |             | created_at              |
  | about_description       |             +-------------------------+
  | contact_email           |
  | contact_phone           |
  | instagram_url           |
  | youtube_url             |
  | spotify_url             |
  | x_url                   |
  | footer_text             |
  | cta_text                |
  | cta_destination         |
  | updated_at              |
  +-------------------------+

              ▲
              │
              │
  +-----------+-------------+       1:N   +-------------------------+
  |         events          | <---------- |      registrations      |
  +-------------------------+             +-------------------------+
  | id (PK)                 |             | id (PK)                 |
  | title                   |             | event_id (FK)           |
  | slug (Unique)           |             | name                    |
  | description             |             | email                   |
  | date                    |             | phone                   |
  | start_time              |             | attendees               |
  | end_time                |             | created_at              |
  | location                |             +-------------------------+
  | venue                   |
  | category                |
  | hero_image_url          |
  | published               |
  | registration_enabled    |
  | created_at              |
  | updated_at              |
  +------------+------------+
               │ 1
               │
               │ M:N
               ▼
  +-------------------------+       N:1   +-------------------------+
  |      event_artists      | ----------> |         artists         |
  +-------------------------+             +-------------------------+
  | id (PK)                 |             | id (PK)                 |
  | event_id (FK)           |             | name                    |
  | artist_id (FK)          |             | category                |
  | display_order           |             | biography               |
  | unique(event, artist)   |             | image_url               |
  +-------------------------+             | created_at              |
                                          | updated_at              |
                                          +-------------------------+
```

---

## Tables Definition

### 1. `events`
Stores festival tour dates, arena venues, categories, and public visibility flags.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique event identifier |
| `title` | TEXT | NOT NULL | Festival edition title |
| `slug` | TEXT | NOT NULL, UNIQUE | URL slug for `/events/[slug]` |
| `description` | TEXT | | Comprehensive event overview |
| `date` | DATE | NOT NULL | Scheduled calendar date |
| `start_time` | TEXT | DEFAULT '18:00' | Gate opening time |
| `end_time` | TEXT | DEFAULT '02:00' | Curfew / end time |
| `location` | TEXT | NOT NULL | City and state/country |
| `venue` | TEXT | NOT NULL | Arena or grounds facility name |
| `category` | TEXT | DEFAULT 'Music Festival' | Music category or genre |
| `hero_image_url` | TEXT | | Banner atmosphere image |
| `published` | BOOLEAN | NOT NULL DEFAULT true | Public visibility toggle |
| `registration_enabled`| BOOLEAN | NOT NULL DEFAULT true | Pass booking availability |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

### 2. `artists`
Stores musical performers, headliners, and supporting stage acts.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique artist identifier |
| `name` | TEXT | NOT NULL | Performer / group name |
| `category` | TEXT | NOT NULL | Role (e.g. Headliner, Live Act) |
| `biography` | TEXT | | Artist narrative and achievements |
| `image_url` | TEXT | | Artist portrait photograph |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

### 3. `event_artists`
Junction table mapping artists to specific festival events and controlling stage order.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique junction ID |
| `event_id` | UUID | NOT NULL REFERENCES events(id) ON DELETE CASCADE | Event foreign key |
| `artist_id` | UUID | NOT NULL REFERENCES artists(id) ON DELETE CASCADE | Artist foreign key |
| `display_order` | INTEGER | NOT NULL DEFAULT 0 | Ordering index on lineup card |

### 4. `registrations`
Stores attendee pass bookings received through the registration portal.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique reservation ID |
| `event_id` | UUID | NOT NULL REFERENCES events(id) ON DELETE CASCADE | Booked event foreign key |
| `name` | TEXT | NOT NULL | Attendee legal name |
| `email` | TEXT | NOT NULL | Contact email for pass delivery |
| `phone` | TEXT | NOT NULL | Attendee phone number |
| `attendees` | INTEGER | NOT NULL DEFAULT 1 CHECK (1-20) | Number of guest passes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Registration submission date |

### 5. `gallery`
Stores curated festival atmosphere photography and lightbox metadata.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique image record ID |
| `image_url` | TEXT | NOT NULL | Image asset link |
| `title` | TEXT | | Photo caption title |
| `caption` | TEXT | | Expanded sensory description |
| `display_order` | INTEGER | NOT NULL DEFAULT 0 | Order in gallery grid |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Upload timestamp |

### 6. `site_settings`
Singleton row storing dynamic platform configuration and branding.

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | `00000000-0000-0000-0000-000000000001` | Fixed configuration PK |
| `site_name` | TEXT | `'SONIC FEST'` | Festival / website name |
| `logo_url` | TEXT | `''` | Custom brand logo link |
| `hero_title` | TEXT | `'THE ULTIMATE MUSIC EXPERIENCE'` | Hero primary heading |
| `hero_subtitle`| TEXT | `'Feel the beat. Live the vibe.'` | Supporting hero tagline |
| `about_title` | TEXT | `'Sonic Fest 2025'` | About section title |
| `about_description` | TEXT | `'Get ready for an electrifying...'` | About section narrative |
| `contact_email`| TEXT | `'contact@sonicfest.live'` | Official contact address |
| `contact_phone`| TEXT | `'+91 (022) 8900-3450'` | Official hotline |
| `instagram_url`| TEXT | `'https://instagram.com'` | Instagram handle link |
| `youtube_url` | TEXT | `'https://youtube.com'` | YouTube channel link |
| `spotify_url` | TEXT | `'https://spotify.com'` | Spotify playlist link |
| `x_url` | TEXT | `'https://x.com'` | X profile link |
| `footer_text` | TEXT | `'© 2025 SONIC FEST. All rights reserved.'` | Footer copyright copy |
| `cta_text` | TEXT | `'Get Tickets'` | Main navbar button label |
| `cta_destination`| TEXT | `'/register'` | Main navbar button link |

---

## Row Level Security (RLS) Policies

All tables have RLS enabled:
- **`events`**: Public `SELECT` allowed where `published = true`. Authenticated users (`auth.role() = 'authenticated'`) have full `ALL` CRUD access.
- **`artists`**: Public `SELECT` allowed. Authenticated users have full `ALL` CRUD access.
- **`event_artists`**: Public `SELECT` allowed. Authenticated users have full `ALL` access.
- **`registrations`**: Public `INSERT` allowed with input validation checks. Only authenticated users (`auth.role() = 'authenticated'`) can perform `SELECT`, `UPDATE`, or `DELETE`.
- **`gallery`**: Public `SELECT` allowed. Authenticated users have full `ALL` CRUD access.
- **`site_settings`**: Public `SELECT` allowed. Authenticated users have full `ALL` CRUD access.

---

## Migrations & Seed Execution

1. Open your Supabase Project Dashboard -> **SQL Editor**.
2. Run `supabase/migrations/001_initial_schema.sql` to instantiate tables, indexes, RLS policies, and storage bucket configuration.
3. Run `supabase/seed.sql` to populate sample festival tour dates, artists, media moments, and default settings.
