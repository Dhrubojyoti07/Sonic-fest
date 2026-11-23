"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { GalleryItem } from "@/types/database";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  AlertCircle,
  X,
  Upload,
} from "lucide-react";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("display_order", { ascending: true });

      if (data) setItems(data);
    } catch (err) {
      console.warn("Fetch gallery error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleCreateNew = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingItem({
      image_url:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      title: "",
      caption: "",
      display_order: items.length + 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.image_url) {
      setErrorMsg("Image URL is required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const payload = {
      image_url: editingItem.image_url.trim(),
      title: editingItem.title?.trim() || "",
      caption: editingItem.caption?.trim() || "",
      display_order: Number(editingItem.display_order) || 1,
    };

    try {
      if (editingItem.id) {
        const { error } = await supabase
          .from("gallery")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
        setSuccessMsg("Gallery item updated!");
      } else {
        const { error } = await supabase.from("gallery").insert(payload);
        if (error) throw error;
        setSuccessMsg("Photo added to festival gallery!");
      }

      setEditingItem(null);
      await fetchGallery();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save photo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery photo?")) return;

    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      setSuccessMsg("Photo removed from gallery.");
      await fetchGallery();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete photo.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Gallery Showcase"
        subtitle="Upload festival photos, stage captures, crowd energy, and manage presentation order."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">
              Festival Moments
            </h2>
            <p className="text-xs text-foreground-muted">
              {items.length} photos published in public gallery.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleCreateNew}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Photo
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden bg-surface-subtle border border-white/10 flex flex-col justify-between group shadow-card"
            >
              <div className="relative h-48 overflow-hidden bg-surface-elevated">
                <img
                  src={item.image_url}
                  alt={item.title || "Festival Moment"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white">
                  Order: #{item.display_order}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold uppercase text-white truncate">
                    {item.title || "Untitled Moment"}
                  </h4>
                  {item.caption && (
                    <p className="mt-1 text-xs text-foreground-muted line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 text-primary hover:text-white rounded-lg hover:bg-primary/20 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0f0d1b] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                {editingItem.id ? "Edit Gallery Item" : "Add Photo to Gallery"}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Image URL <span className="text-primary">*</span>
                </label>
                <input
                  type="url"
                  value={editingItem.image_url || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, image_url: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingItem.display_order ?? 1}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      display_order: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Title
                </label>
                <input
                  type="text"
                  value={editingItem.title || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  placeholder="e.g. Laser Pyrotechnics Mainstage"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Caption / Description
                </label>
                <textarea
                  rows={3}
                  value={editingItem.caption || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, caption: e.target.value })
                  }
                  placeholder="Atmosphere caption displayed when clicked..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                >
                  Save Photo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
