"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Event } from "@/types/database";
import { formatDate } from "@/lib/utils/cn";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  MapPin,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.warn("Fetch events error:", error);
      } else if (data) {
        setEvents(data);
      }
    } catch (err) {
      console.warn("Fetch events exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateNew = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingEvent({
      title: "",
      slug: "",
      description: "",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      start_time: "18:00",
      end_time: "02:00",
      location: "",
      venue: "",
      category: "Electronic / Live Festival",
      hero_image_url:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80",
      published: true,
      registration_enabled: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent?.date || !editingEvent?.venue || !editingEvent?.location) {
      setErrorMsg("Please fill in Title, Date, Venue, and Location.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    // Generate slug from title if empty
    const slug =
      editingEvent.slug?.trim() ||
      editingEvent.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload = {
      title: editingEvent.title.trim(),
      slug,
      description: editingEvent.description || "",
      date: editingEvent.date,
      start_time: editingEvent.start_time || "18:00",
      end_time: editingEvent.end_time || "02:00",
      location: editingEvent.location.trim(),
      venue: editingEvent.venue.trim(),
      category: editingEvent.category || "Music Festival",
      hero_image_url: editingEvent.hero_image_url || "",
      published: editingEvent.published ?? true,
      registration_enabled: editingEvent.registration_enabled ?? true,
    };

    try {
      if (editingEvent.id) {
        // Update
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingEvent.id);

        if (error) throw error;
        setSuccessMsg("Event updated successfully!");
      } else {
        // Insert
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        setSuccessMsg("Event created successfully!");
      }

      setEditingEvent(null);
      await fetchEvents();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      setSuccessMsg("Event deleted successfully.");
      await fetchEvents();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete event.");
    }
  };

  const handleTogglePublish = async (event: Event) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ published: !event.published })
        .eq("id", event.id);

      if (error) throw error;
      await fetchEvents();
    } catch (err: unknown) {
      setErrorMsg("Failed to update status.");
    }
  };

  const handleToggleRegistration = async (event: Event) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ registration_enabled: !event.registration_enabled })
        .eq("id", event.id);

      if (error) throw error;
      await fetchEvents();
    } catch (err: unknown) {
      setErrorMsg("Failed to toggle registration.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Events Management"
        subtitle="Create, edit, schedule, and manage public visibility for festival dates."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">
              All Festival Editions
            </h2>
            <p className="text-xs text-foreground-muted">
              {events.length} event dates currently stored in database.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleCreateNew}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Event
          </Button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Events Table / Card List */}
        <div className="rounded-3xl bg-surface-subtle border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-foreground-muted bg-white/5">
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-4">Date & Time</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Pass Registration</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-foreground-muted">
                      No events found. Click "+ Create New Event" to add your first festival date.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              event.hero_image_url ||
                              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=80"
                            }
                            alt={event.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">
                              {event.title}
                            </span>
                            <span className="text-[11px] text-foreground-muted font-mono">
                              /events/{event.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">
                          {formatDate(event.date)}
                        </div>
                        <div className="text-[11px] text-foreground-muted">
                          {event.start_time || "18:00"} – {event.end_time || "02:00"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">{event.venue}</div>
                        <div className="text-[11px] text-foreground-muted">
                          {event.location}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleTogglePublish(event)}
                          title="Click to toggle published status"
                        >
                          {event.published ? (
                            <Badge variant="success">Published</Badge>
                          ) : (
                            <Badge variant="outline">Draft / Hidden</Badge>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleRegistration(event)}
                          title="Click to toggle registration status"
                        >
                          {event.registration_enabled ? (
                            <Badge variant="cyan">Open</Badge>
                          ) : (
                            <Badge variant="warning">Closed</Badge>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                        <Link
                          href={`/events/${event.slug}`}
                          target="_blank"
                          className="p-2 text-foreground-muted hover:text-white inline-flex rounded-lg hover:bg-white/5 transition-colors"
                          title="Preview Live"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="p-2 text-primary hover:text-primary-hover inline-flex rounded-lg hover:bg-primary/10 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          className="p-2 text-red-400 hover:text-red-300 inline-flex rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0f0d1b] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                {editingEvent.id ? "Edit Festival Event" : "Create New Festival Event"}
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Event Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={editingEvent.title || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, title: e.target.value })
                  }
                  placeholder="e.g. Sonic Fest 2026 — Delhi Edition"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingEvent.slug || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, slug: e.target.value })
                    }
                    placeholder="sonic-fest-2026-delhi"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingEvent.category || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, category: e.target.value })
                    }
                    placeholder="Electronic / Live Festival"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Date <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingEvent.date || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editingEvent.start_time || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, start_time: e.target.value })
                    }
                    placeholder="18:00"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editingEvent.end_time || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, end_time: e.target.value })
                    }
                    placeholder="02:00"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Venue Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingEvent.venue || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, venue: e.target.value })
                    }
                    placeholder="e.g. Indira Gandhi Arena"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    City / Location <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, location: e.target.value })
                    }
                    placeholder="e.g. New Delhi, India"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Hero Image URL
                </label>
                <input
                  type="url"
                  value={editingEvent.hero_image_url || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, hero_image_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Event Description
                </label>
                <textarea
                  rows={4}
                  value={editingEvent.description || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                  placeholder="Describe the artists, stages, and unique atmosphere..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={editingEvent.published ?? true}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, published: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span>Publish to Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={editingEvent.registration_enabled ?? true}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        registration_enabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span>Enable Pass Registrations</span>
                </label>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setEditingEvent(null)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                >
                  Save Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
