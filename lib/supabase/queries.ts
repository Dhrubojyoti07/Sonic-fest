import { createServerSupabaseClient } from "./server";
import { createClient as createBrowserClient } from "./client";
import {
  DEFAULT_SITE_SETTINGS,
  FALLBACK_FEATURED_EVENT,
  FALLBACK_ARTISTS,
  FALLBACK_GALLERY,
} from "@/lib/constants/defaults";
import { SiteSettings, Event, Artist, GalleryItem } from "@/types/database";

/**
 * Fetch dynamic site configuration (with fallback defaults).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Fetch featured primary event for hero & countdown.
 */
export async function getFeaturedEvent(): Promise<Event> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: event, error } = await supabase
      .from("events")
      .select(
        `
        *,
        event_artists (
          display_order,
          artists (*)
        )
      `
      )
      .eq("published", true)
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !event) {
      return {
        ...FALLBACK_FEATURED_EVENT,
        artists: FALLBACK_ARTISTS,
      };
    }

    // Map junction artists
    const mappedArtists: Artist[] = (event.event_artists || [])
      .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
      .map((ea: { artists: Artist }) => ea.artists)
      .filter(Boolean);

    return {
      ...event,
      artists: mappedArtists.length > 0 ? mappedArtists : FALLBACK_ARTISTS,
    };
  } catch {
    return {
      ...FALLBACK_FEATURED_EVENT,
      artists: FALLBACK_ARTISTS,
    };
  }
}

/**
 * Fetch all published events.
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        event_artists (
          display_order,
          artists (*)
        )
      `
      )
      .eq("published", true)
      .order("date", { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        {
          ...FALLBACK_FEATURED_EVENT,
          artists: FALLBACK_ARTISTS,
        },
      ];
    }

    return data.map((event) => ({
      ...event,
      artists: (event.event_artists || [])
        .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
        .map((ea: { artists: Artist }) => ea.artists)
        .filter(Boolean),
    }));
  } catch {
    return [
      {
        ...FALLBACK_FEATURED_EVENT,
        artists: FALLBACK_ARTISTS,
      },
    ];
  }
}

/**
 * Fetch a single event by slug.
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: event, error } = await supabase
      .from("events")
      .select(
        `
        *,
        event_artists (
          display_order,
          artists (*)
        )
      `
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !event) {
      // Fallback matching default slug
      if (slug === FALLBACK_FEATURED_EVENT.slug) {
        return {
          ...FALLBACK_FEATURED_EVENT,
          artists: FALLBACK_ARTISTS,
        };
      }
      return null;
    }

    const mappedArtists: Artist[] = (event.event_artists || [])
      .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
      .map((ea: { artists: Artist }) => ea.artists)
      .filter(Boolean);

    return {
      ...event,
      artists: mappedArtists,
    };
  } catch {
    if (slug === FALLBACK_FEATURED_EVENT.slug) {
      return {
        ...FALLBACK_FEATURED_EVENT,
        artists: FALLBACK_ARTISTS,
      };
    }
    return null;
  }
}

/**
 * Fetch all artists.
 */
export async function getAllArtists(): Promise<Artist[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_ARTISTS;
    }

    return data;
  } catch {
    return FALLBACK_ARTISTS;
  }
}

/**
 * Fetch gallery items.
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_GALLERY;
    }

    return data;
  } catch {
    return FALLBACK_GALLERY;
  }
}
