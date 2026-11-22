export interface SiteSettings {
  id: string;
  site_name: string;
  logo_url?: string | null;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_description: string;
  contact_email: string;
  contact_phone: string;
  instagram_url?: string | null;
  youtube_url?: string | null;
  spotify_url?: string | null;
  x_url?: string | null;
  footer_text: string;
  cta_text: string;
  cta_destination: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  location: string;
  venue: string;
  category?: string | null;
  hero_image_url?: string | null;
  published: boolean;
  registration_enabled: boolean;
  created_at?: string;
  updated_at?: string;
  artists?: Artist[];
}

export interface Artist {
  id: string;
  name: string;
  category: string;
  biography?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  display_order?: number;
}

export interface EventArtist {
  id: string;
  event_id: string;
  artist_id: string;
  display_order: number;
}

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  attendees: number;
  ticket_code?: string | null;
  status?: "confirmed" | "checked_in" | "cancelled" | string;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  created_at?: string;
  events?: {
    title: string;
    date: string;
    venue: string;
    location: string;
  };
}

export interface GalleryItem {
  id: string;
  image_url: string;
  title?: string | null;
  caption?: string | null;
  display_order: number;
  created_at?: string;
}

export interface RegistrationFormData {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  attendees: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
