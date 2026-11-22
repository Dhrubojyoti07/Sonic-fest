"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Artist, Event } from "@/types/database";
import {
  Mic2,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  AlertCircle,
  X,
  Calendar,
  Layers,
} from "lucide-react";

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArtist, setEditingArtist] = useState<Partial<Artist> | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [artistsRes, eventsRes] = await Promise.all([
        supabase.from("artists").select("*").order("name", { ascending: true }),
        supabase.from("events").select("id, title").order("title", { ascending: true }),
      ]);

      if (artistsRes.data) setArtists(artistsRes.data);
      if (eventsRes.data) {
        setEvents(eventsRes.data);
        if (eventsRes.data[0]) setSelectedEventId(eventsRes.data[0].id);
      }
    } catch (err) {
      console.warn("Fetch artists error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNew = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingArtist({
      name: "",
      category: "Global Headliner",
      biography: "",
      image_url:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist?.name || !editingArtist?.category) {
      setErrorMsg("Artist name and category are required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const payload = {
      name: editingArtist.name.trim(),
      category: editingArtist.category.trim(),
      biography: editingArtist.biography?.trim() || "",
      image_url: editingArtist.image_url?.trim() || "",
    };

    try {
      let savedArtistId = editingArtist.id;

      if (editingArtist.id) {
        // Update
        const { error } = await supabase
          .from("artists")
          .update(payload)
          .eq("id", editingArtist.id);
        if (error) throw error;
        setSuccessMsg("Artist updated successfully!");
      } else {
        // Insert
        const { data, error } = await supabase
          .from("artists")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        savedArtistId = data.id;
        setSuccessMsg("Artist added to lineup!");
      }

      // Assign to selected event if chosen
      if (savedArtistId && selectedEventId) {
        await supabase
          .from("event_artists")
          .upsert(
            {
              event_id: selectedEventId,
              artist_id: savedArtistId,
              display_order: 1,
            },
            { onConflict: "event_id,artist_id" }
          );
      }

      setEditingArtist(null);
      await fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save artist.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove artist "${name}"?`)) return;

    try {
      const { error } = await supabase.from("artists").delete().eq("id", id);
      if (error) throw error;
      setSuccessMsg("Artist removed from lineup.");
      await fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete artist.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Artist Lineup Management"
        subtitle="Curate performers, upload portraits, assign acts to stages and tour editions."
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">
              Lineup Roster
            </h2>
            <p className="text-xs text-foreground-muted">
              {artists.length} acts confirmed across all festival stages.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleCreateNew}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Artist
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

        {/* Artists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="p-5 rounded-2xl bg-surface-subtle border border-white/10 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all shadow-card"
            >
              <div className="flex items-start gap-4">
                <img
                  src={
                    artist.image_url ||
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80"
                  }
                  alt={artist.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/15"
                />
                <div className="space-y-1 overflow-hidden">
                  <Badge variant="purple">{artist.category}</Badge>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight truncate">
                    {artist.name}
                  </h3>
                </div>
              </div>

              {artist.biography && (
                <p className="text-xs text-foreground-muted line-clamp-3 leading-relaxed">
                  {artist.biography}
                </p>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-foreground-muted flex items-center gap-1">
                  <Mic2 className="w-3.5 h-3.5 text-primary" /> Active Act
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingArtist(artist)}
                    className="p-1.5 text-primary hover:text-white rounded-lg hover:bg-primary/20 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(artist.id, artist.name)}
                    className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {editingArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0f0d1b] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                {editingArtist.id ? "Edit Artist" : "Add Artist to Lineup"}
              </h3>
              <button
                onClick={() => setEditingArtist(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Artist / Act Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={editingArtist.name || ""}
                  onChange={(e) =>
                    setEditingArtist({ ...editingArtist, name: e.target.value })
                  }
                  placeholder="e.g. The Weeknd, Arctic Monkeys"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Category / Role <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={editingArtist.category || ""}
                  onChange={(e) =>
                    setEditingArtist({ ...editingArtist, category: e.target.value })
                  }
                  placeholder="Global Headliner / Electronic Live Act / Indie Rock"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Artist Portrait Image URL
                </label>
                <input
                  type="url"
                  value={editingArtist.image_url || ""}
                  onChange={(e) =>
                    setEditingArtist({ ...editingArtist, image_url: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {events.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Assign to Festival Event
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">None / Unassigned</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id} className="bg-[#0f0d1b]">
                        {e.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Biography & Stage Notes
                </label>
                <textarea
                  rows={4}
                  value={editingArtist.biography || ""}
                  onChange={(e) =>
                    setEditingArtist({ ...editingArtist, biography: e.target.value })
                  }
                  placeholder="Grammy-winning pioneer celebrated for monumental live sets..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setEditingArtist(null)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                >
                  Save Artist
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
