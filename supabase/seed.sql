-- =============================================================================
-- SONIC FEST - Default Seed Data
-- =============================================================================

-- 1. Site Settings (Single Default Row)
INSERT INTO public.site_settings (
    id,
    site_name,
    logo_url,
    hero_title,
    hero_subtitle,
    about_title,
    about_description,
    contact_email,
    contact_phone,
    instagram_url,
    youtube_url,
    spotify_url,
    x_url,
    footer_text,
    cta_text,
    cta_destination
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SONIC FEST',
    '',
    'THE ULTIMATE MUSIC EXPERIENCE',
    'Feel the beat. Live the vibe.',
    'Sonic Fest 2025',
    'Get ready for an electrifying musical journey with world-class artists, immersive stages, and an unforgettable atmosphere.',
    'contact@sonicfest.live',
    '+91 (022) 8900-3450',
    'https://instagram.com/sonicfest',
    'https://youtube.com/@sonicfest',
    'https://spotify.com',
    'https://x.com/sonicfest',
    '© 2025 SONIC FEST. All rights reserved. Crafted for extraordinary live experiences.',
    'Get Tickets',
    '/register'
) ON CONFLICT (id) DO UPDATE SET
    site_name = EXCLUDED.site_name,
    hero_title = EXCLUDED.hero_title,
    hero_subtitle = EXCLUDED.hero_subtitle;

-- 2. Initial Featured Events
INSERT INTO public.events (
    id,
    title,
    slug,
    description,
    date,
    start_time,
    end_time,
    location,
    venue,
    category,
    hero_image_url,
    published,
    registration_enabled
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Sonic Fest 2025 — Mumbai Edition',
    'sonic-fest-2025-mumbai',
    'Immerse yourself in two days of heart-thumping soundscapes, mind-bending holographic stage visuals, and electrifying performances from global headliners at India''s premier music gathering.',
    CURRENT_DATE + INTERVAL '45 days',
    '17:00',
    '02:30',
    'Mumbai, Maharashtra',
    'NeoSphere Arena, Bandra Kurla Complex',
    'Electronic / Live Festival',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80',
    true,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Sonic Nights: Neon Underground',
    'sonic-nights-neon-underground',
    'An exclusive after-hours warehouse session featuring cutting-edge melodic techno, analog synthesizers, and immersive 360-degree laser mapping.',
    CURRENT_DATE + INTERVAL '60 days',
    '21:00',
    '05:00',
    'Bengaluru, Karnataka',
    'The Warehouse Project, Whitefield',
    'Melodic Techno / Ambient',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80',
    true,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Sonic Sunset Sessions',
    'sonic-sunset-sessions-goa',
    'A coastal celebration of deep progressive house, golden hour grooves, and organic downtempo sounds right on the shores of North Goa.',
    CURRENT_DATE + INTERVAL '90 days',
    '16:00',
    '01:00',
    'Vagator, Goa',
    'Solstice Cliffside Arena',
    'Progressive House / Beach',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1920&q=80',
    true,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Featured Artists
INSERT INTO public.artists (
    id,
    name,
    category,
    biography,
    image_url
) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'The Weeknd',
    'Global Headliner',
    'Grammy-winning pioneer of moody R&B and cinematic synth-pop, delivering transcendent arena-scale performances with dramatic visual storytelling.',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Arctic Monkeys',
    'Headliner / Rock',
    'Iconic British indie rock heavyweights blending razor-sharp lyrics with swaggering guitar riffs and hypnotic vintage grooves.',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'RÜFÜS DU SOL',
    'Electronic Live Act',
    'Australian Grammy-winning electronic trio celebrated worldwide for their ethereal, emotional live dance music and euphoric stage energy.',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Lana Del Rey',
    'Alt-Pop / Headliner',
    'Revered songstress renowned for her cinematic nostalgia, melancholic glamour, and sweeping orchestral pop ballads.',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Tale of Us',
    'Afterlife / Techno',
    'Pioneers of the revolutionary Afterlife visual and melodic techno movement, famous for mind-bending monumental visual projections.',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
),
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Peggy Gou',
    'House / Electronic',
    'Berlin-based Korean DJ sensation known for infectious house anthems, pulsating rhythms, and unmatched festival charisma.',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Event Artist Lineup Mappings
INSERT INTO public.event_artists (event_id, artist_id, display_order)
VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2),
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3),
('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 4),
('22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1),
('22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 2),
('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1),
('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 2)
ON CONFLICT (event_id, artist_id) DO NOTHING;

-- 5. Gallery Showcase Images
INSERT INTO public.gallery (id, image_url, title, caption, display_order)
VALUES
(
    '99999991-9999-9999-9999-999999999991',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'Mainstage Pyrotechnics',
    'High-voltage laser and pyrotechnic spectacle during the opening headliner set.',
    1
),
(
    '99999992-9999-9999-9999-999999999992',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    'The Crowd in Euphoria',
    'Over 40,000 festival-goers celebrating united in sound and energy.',
    2
),
(
    '99999993-9999-9999-9999-999999999993',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    'Holographic Dimensions',
    'Groundbreaking 3D holographic projection mapping towering 30 meters above the NeoSphere Arena.',
    3
),
(
    '99999994-9999-9999-9999-999999999994',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    'Sunset Rave Sessions',
    'Golden hour beats as the dusk gives way to glowing neon installations.',
    4
),
(
    '99999995-9999-9999-9999-999999999995',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    'Intimate Warehouse Resonance',
    'Underground club atmosphere powered by bespoke custom acoustics.',
    5
),
(
    '99999996-9999-9999-9999-999999999996',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80',
    'The Sonic Horizon',
    'Midnight fireworks illuminating the entire festival village.',
    6
)
ON CONFLICT (id) DO NOTHING;
