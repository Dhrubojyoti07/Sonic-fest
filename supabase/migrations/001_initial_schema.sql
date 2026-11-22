-- =============================================================================
-- SONIC FEST - Database Schema Migration
-- Production-ready schema with Row Level Security (RLS) and Storage configuration
-- =============================================================================

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. EVENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    date DATE NOT NULL,
    start_time TEXT DEFAULT '18:00',
    end_time TEXT DEFAULT '02:00',
    location TEXT NOT NULL,
    venue TEXT NOT NULL,
    category TEXT DEFAULT 'Music Festival',
    hero_image_url TEXT,
    published BOOLEAN NOT NULL DEFAULT true,
    registration_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on slug and date for quick lookups
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_published ON public.events(published);

-- -----------------------------------------------------------------------------
-- 2. ARTISTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Performer',
    biography TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_artists_name ON public.artists(name);

-- -----------------------------------------------------------------------------
-- 3. EVENT_ARTISTS (JUNCTION TABLE)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT unique_event_artist UNIQUE (event_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_event_artists_event ON public.event_artists(event_id);
CREATE INDEX IF NOT EXISTS idx_event_artists_artist ON public.event_artists(artist_id);

-- -----------------------------------------------------------------------------
-- 4. REGISTRATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    attendees INTEGER NOT NULL DEFAULT 1 CHECK (attendees > 0 AND attendees <= 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. GALLERY TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_gallery_order ON public.gallery(display_order ASC);

-- -----------------------------------------------------------------------------
-- 6. SITE_SETTINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL DEFAULT 'SONIC FEST',
    logo_url TEXT,
    hero_title TEXT NOT NULL DEFAULT 'THE ULTIMATE MUSIC EXPERIENCE',
    hero_subtitle TEXT NOT NULL DEFAULT 'Feel the beat. Live the vibe.',
    about_title TEXT NOT NULL DEFAULT 'Sonic Fest 2025',
    about_description TEXT NOT NULL DEFAULT 'Get ready for an electrifying musical journey with world-class artists, immersive stages, and an unforgettable atmosphere.',
    contact_email TEXT NOT NULL DEFAULT 'info@sonicfest.com',
    contact_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
    instagram_url TEXT DEFAULT 'https://instagram.com',
    youtube_url TEXT DEFAULT 'https://youtube.com',
    spotify_url TEXT DEFAULT 'https://spotify.com',
    x_url TEXT DEFAULT 'https://x.com',
    footer_text TEXT NOT NULL DEFAULT '© 2025 SONIC FEST. All rights reserved.',
    cta_text TEXT NOT NULL DEFAULT 'Get Tickets',
    cta_destination TEXT NOT NULL DEFAULT '/register',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS set_artists_updated_at ON public.artists;
CREATE TRIGGER set_artists_updated_at BEFORE UPDATE ON public.artists
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. EVENTS POLICIES
-- Public can view published events
CREATE POLICY "Public read published events"
    ON public.events FOR SELECT
    USING (published = true OR auth.role() = 'authenticated');

-- Authenticated admins can insert, update, delete events
CREATE POLICY "Admins full access events"
    ON public.events FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. ARTISTS POLICIES
-- Public can view all artists
CREATE POLICY "Public read artists"
    ON public.artists FOR SELECT
    USING (true);

-- Authenticated admins can manage artists
CREATE POLICY "Admins full access artists"
    ON public.artists FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. EVENT_ARTISTS POLICIES
-- Public can read event artists
CREATE POLICY "Public read event_artists"
    ON public.event_artists FOR SELECT
    USING (true);

-- Authenticated admins can manage event artists
CREATE POLICY "Admins full access event_artists"
    ON public.event_artists FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. REGISTRATIONS POLICIES
-- Anyone can submit a registration
CREATE POLICY "Public insert registrations"
    ON public.registrations FOR INSERT
    WITH CHECK (true);

-- Only authenticated admins can read or manage registrations
CREATE POLICY "Admins read registrations"
    ON public.registrations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins manage registrations"
    ON public.registrations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. GALLERY POLICIES
-- Public can view gallery
CREATE POLICY "Public read gallery"
    ON public.gallery FOR SELECT
    USING (true);

-- Authenticated admins can manage gallery
CREATE POLICY "Admins manage gallery"
    ON public.gallery FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. SITE_SETTINGS POLICIES
-- Public can view site settings
CREATE POLICY "Public read site_settings"
    ON public.site_settings FOR SELECT
    USING (true);

-- Authenticated admins can manage site settings
CREATE POLICY "Admins manage site_settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- STORAGE BUCKET INITIALIZATION (Supabase Storage)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read media objects
CREATE POLICY "Public can view media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'media');

-- Authenticated users can upload media objects
CREATE POLICY "Admins can upload media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'media');

-- Authenticated users can update media objects
CREATE POLICY "Admins can update media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'media');

-- Authenticated users can delete media objects
CREATE POLICY "Admins can delete media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'media');
