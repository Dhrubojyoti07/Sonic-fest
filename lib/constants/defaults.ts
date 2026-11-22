import { SiteSettings, Event, Artist, GalleryItem } from "@/types/database";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  site_name: "SONIC FEST",
  logo_url: "",
  hero_title: "THE ULTIMATE MUSIC EXPERIENCE",
  hero_subtitle: "Feel the beat. Live the vibe.",
  about_title: "Sonic Fest 2025",
  about_description:
    "Get ready for an electrifying musical journey with world-class artists, immersive stages, and an unforgettable atmosphere.",
  contact_email: "contact@sonicfest.live",
  contact_phone: "+91 (022) 8900-3450",
  instagram_url: "https://instagram.com",
  youtube_url: "https://youtube.com",
  spotify_url: "https://spotify.com",
  x_url: "https://x.com",
  footer_text: "© 2025 SONIC FEST. All rights reserved. Crafted for extraordinary live experiences.",
  cta_text: "Get Tickets",
  cta_destination: "/register",
};

export const FALLBACK_FEATURED_EVENT: Event = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Sonic Fest 2025 — Mumbai Edition",
  slug: "sonic-fest-2025-mumbai",
  description:
    "Immerse yourself in two days of heart-thumping soundscapes, mind-bending holographic stage visuals, and electrifying performances from global headliners at India's premier music gathering.",
  date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  start_time: "17:00",
  end_time: "02:30",
  location: "Mumbai, Maharashtra",
  venue: "NeoSphere Arena, Bandra Kurla Complex",
  category: "Electronic / Live Festival",
  hero_image_url:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80",
  published: true,
  registration_enabled: true,
};

export const FALLBACK_ARTISTS: Artist[] = [
  {
    id: "a1",
    name: "The Weeknd",
    category: "Global Headliner",
    biography:
      "Grammy-winning pioneer of moody R&B and cinematic synth-pop, delivering transcendent arena-scale performances with dramatic visual storytelling.",
    image_url:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "a2",
    name: "Arctic Monkeys",
    category: "Headliner / Rock",
    biography:
      "Iconic British indie rock heavyweights blending razor-sharp lyrics with swaggering guitar riffs and hypnotic vintage grooves.",
    image_url:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "a3",
    name: "RÜFÜS DU SOL",
    category: "Electronic Live Act",
    biography:
      "Australian Grammy-winning electronic trio celebrated worldwide for their ethereal, emotional live dance music and euphoric stage energy.",
    image_url:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "a4",
    name: "Lana Del Rey",
    category: "Alt-Pop / Headliner",
    biography:
      "Revered songstress renowned for her cinematic nostalgia, melancholic glamour, and sweeping orchestral pop ballads.",
    image_url:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  },
];

export const FALLBACK_GALLERY: GalleryItem[] = [
  {
    id: "g1",
    image_url:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    title: "Mainstage Pyrotechnics",
    caption: "High-voltage laser and pyrotechnic spectacle during the opening headliner set.",
    display_order: 1,
  },
  {
    id: "g2",
    image_url:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    title: "The Crowd in Euphoria",
    caption: "Over 40,000 festival-goers celebrating united in sound and energy.",
    display_order: 2,
  },
  {
    id: "g3",
    image_url:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    title: "Holographic Dimensions",
    caption: "Groundbreaking 3D holographic projection mapping towering above the arena.",
    display_order: 3,
  },
  {
    id: "g4",
    image_url:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    title: "Sunset Rave Sessions",
    caption: "Golden hour beats as dusk gives way to glowing neon installations.",
    display_order: 4,
  },
  {
    id: "g5",
    image_url:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
    title: "Intimate Warehouse Resonance",
    caption: "Underground club atmosphere powered by bespoke custom acoustics.",
    display_order: 5,
  },
  {
    id: "g6",
    image_url:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80",
    title: "The Sonic Horizon",
    caption: "Midnight fireworks illuminating the entire festival village.",
    display_order: 6,
  },
];
