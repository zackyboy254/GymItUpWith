"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2, Plus, Trash2, CheckCircle, AlertCircle, Pencil, Star,
  EyeOff, Eye, GripVertical, Upload, Link2, X, Save, Video
} from 'lucide-react';

interface VideoItem {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
  status: 'active' | 'disabled';
  sort_order?: number;
  created_at?: string;
}

function getYoutubeThumbnail(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/watch\?v=([^&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  }
  return null;
}

function isYoutube(url: string) {
  return /youtu\.?be/.test(url);
}

function getVideoThumbnail(video: Pick<VideoItem, 'video_url' | 'thumbnail_url'>): string | null {
  if (video.thumbnail_url) return video.thumbnail_url;
  if (isYoutube(video.video_url)) return getYoutubeThumbnail(video.video_url);
  return null;
}

const CATEGORIES = ['Workout', 'Nutrition', 'Motivation', 'Training Tips', 'Events', 'Other'];

export default function VideosEditor() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMigrationNote, setShowMigrationNote] = useState(false);

  // Add form state
  const [addMode, setAddMode] = useState<'file' | 'youtube'>('youtube');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Workout');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [featured, setFeatured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editVideo, setEditVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);

  // Drag state
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  useEffect(() => { fetchVideos(); }, []);

  const showMsg = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      // Simple select without ordering to avoid column errors
      const { data, error } = await supabase.from('videos').select('*');
      if (error) {
        console.error('fetchVideos error:', error);
        showMsg('error', `Could not load videos: ${error.message || error.details || 'unknown error'}`);
        setVideos([]);
      } else {
        // If sort_order exists, sort locally, otherwise keep as is
        const sorted = (data as VideoItem[])?.sort?.((a: VideoItem, b: VideoItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) ?? [];
        setVideos(sorted);
      }
    } catch (err: any) {
      console.error('fetchVideos exception:', err);
      showMsg('error', err?.message || 'Unexpected error loading videos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return showMsg('error', 'Title is required.');
    if (addMode === 'youtube' && !youtubeUrl.trim()) return showMsg('error', 'YouTube URL is required.');
    if (addMode === 'file' && !videoFile) return showMsg('error', 'Please select a video file.');

    setIsSaving(true);
    setMessage(null);
    try {
      let finalUrl = youtubeUrl.trim();

      if (addMode === 'file' && videoFile) {
        setIsUploading(true);
        const ext = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, videoFile, { upsert: false, contentType: videoFile.type });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName);
        finalUrl = urlData.publicUrl;
        setIsUploading(false);
      }

      const maxOrder = videos.length > 0
        ? Math.max(...videos.map(v => v.sort_order ?? 0))
        : 0;

      const insertPayload: Record<string, unknown> = {
        title: title.trim(),
        video_url: finalUrl,
        thumbnail_url: addMode === 'youtube' ? getYoutubeThumbnail(finalUrl) ?? null : null,
        description: description.trim() || null,
        category: category || null,
        is_featured: featured,
        status: 'active',
      };
      // Only include sort_order if we know the column exists (migration has been run)
      if (!showMigrationNote) insertPayload.sort_order = maxOrder + 1;

      const { error } = await supabase.from('videos').insert([insertPayload]);
      if (error) throw error;

      setTitle(''); setDescription(''); setYoutubeUrl(''); setVideoFile(null); setFeatured(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showMsg('success', 'Video added successfully!');
      fetchVideos();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to add video.');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (id: number) => {
    if (!confirm('Delete this video?')) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      showMsg('success', 'Video deleted.');
      fetchVideos();
    } catch { showMsg('error', 'Failed to delete.'); }
  };

  const toggleStatus = async (v: VideoItem) => {
    try {
      await supabase.from('videos').update({ status: v.status === 'active' ? 'disabled' : 'active' }).eq('id', v.id);
      fetchVideos();
    } catch { showMsg('error', 'Failed to update status.'); }
  };

  const toggleFeatured = async (v: VideoItem) => {
    try {
      await supabase.from('videos').update({ is_featured: !v.is_featured }).eq('id', v.id);
      fetchVideos();
    } catch { showMsg('error', 'Failed to update featured.'); }
  };

  // Edit modal
  const openEdit = (v: VideoItem) => {
    setEditVideo(v);
    setEditTitle(v.title);
    setEditDescription(v.description || '');
    setEditCategory(v.category || 'Workout');
    setEditFeatured(v.is_featured || false);
  };
  const closeEdit = () => setEditVideo(null);

  const handleSaveEdit = async () => {
    if (!editVideo) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('videos').update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        category: editCategory,
        is_featured: editFeatured,
      }).eq('id', editVideo.id);
      if (error) throw error;
      showMsg('success', 'Video updated.');
      closeEdit();
      fetchVideos();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to update.');
    } finally {
      setIsSaving(false);
    }
  };

  // Drag to reorder
  const handleDragStart = (id: number) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (dragId === null || dragId === targetId) { setDragId(null); setDragOverId(null); return; }

    const reordered = [...videos];
    const fromIdx = reordered.findIndex(v => v.id === dragId);
    const toIdx = reordered.findIndex(v => v.id === targetId);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const updated = reordered.map((v, i) => ({ ...v, sort_order: i + 1 }));
    setVideos(updated);
    setDragId(null);
    setDragOverId(null);

    try {
      await Promise.all(
        updated.map(v => supabase.from('videos').update({ sort_order: v.sort_order }).eq('id', v.id))
      );
    } catch { showMsg('error', 'Failed to save order.'); fetchVideos(); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Videos Manager</h2>
          <p className="text-xs text-gray-400 mt-0.5">Upload files to storage or paste a YouTube link. Drag cards to reorder.</p>
        </div>
        <span className="text-[10px] text-gray-500 bg-white/5 border border-white/10 rounded-lg px-2 py-1">{videos.length} videos</span>
      </div>

      {/* Migration note */}
      {showMigrationNote && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3">
          <p className="text-xs font-bold">⚠ Database migration needed — run this SQL in Supabase SQL Editor:</p>
          <pre className="text-[10px] bg-black/40 rounded p-3 overflow-x-auto select-all text-green-300">{`ALTER TABLE videos ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
UPDATE videos SET sort_order = id WHERE sort_order = 0;`}</pre>
          <button onClick={() => { setShowMigrationNote(false); fetchVideos(); }} className="text-[10px] text-amber-400 underline">Dismiss (run first)</button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="text-xs">{message.text}</span>
        </div>
      )}

      {/* Add Video Form */}
      <form onSubmit={handleAddVideo} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Video</h3>

        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 w-fit">
          <button type="button" onClick={() => setAddMode('youtube')}
            className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors ${addMode === 'youtube' ? 'bg-[#ff6b00] text-white' : 'bg-black/30 text-gray-400 hover:text-white'}`}>
            <Link2 className="w-3.5 h-3.5" /> YouTube URL
          </button>
          <button type="button" onClick={() => setAddMode('file')}
            className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors ${addMode === 'file' ? 'bg-[#ff6b00] text-white' : 'bg-black/30 text-gray-400 hover:text-white'}`}>
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. Morning HIIT Workout" />
          </div>

          {addMode === 'youtube' ? (
            <div className="space-y-1 md:col-span-2">
              <label className="block text-[9px] text-gray-400 font-bold uppercase">YouTube URL *</label>
              <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                placeholder="https://www.youtube.com/watch?v=..." />
              {youtubeUrl && getYoutubeThumbnail(youtubeUrl) && (
                <img src={getYoutubeThumbnail(youtubeUrl)!} alt="preview" className="h-24 rounded-lg object-cover mt-2 border border-white/10" />
              )}
            </div>
          ) : (
            <div className="space-y-1 md:col-span-2">
              <label className="block text-[9px] text-gray-400 font-bold uppercase">Video File *</label>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ff6b00] file:text-white cursor-pointer" />
              {videoFile && <p className="text-[10px] text-gray-400">Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] cursor-pointer">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="Short description (optional)" />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#ff6b00] cursor-pointer" />
            <label htmlFor="featured" className="text-xs text-gray-300 cursor-pointer">Mark as Featured</label>
          </div>
        </div>

        <button type="submit" disabled={isSaving || isUploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e55a00] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
          {isSaving || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Add Video'}
        </button>
      </form>

      {/* Video Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Videos ({videos.length})</h3>
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl text-gray-500 space-y-2">
            <Video className="w-10 h-10" />
            <p className="text-xs">No videos added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map(v => {
              const thumb = getVideoThumbnail(v);
              const isDraggingOver = dragOverId === v.id;
              return (
                <div
                  key={v.id}
                  draggable
                  onDragStart={() => handleDragStart(v.id)}
                  onDragOver={e => handleDragOver(e, v.id)}
                  onDrop={e => handleDrop(e, v.id)}
                  onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                  className={`group relative rounded-xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                    isDraggingOver ? 'border-[#ff6b00] scale-95' : 'border-white/10'
                  } ${dragId === v.id ? 'opacity-40' : 'opacity-100'}`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-black/60 relative">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={v.title}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.src = '/images/default-thumbnail.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      v.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-gray-700/90 text-gray-300'
                    }`}>{v.status}</div>
                    {v.is_featured && (
                      <div className="absolute top-1.5 right-1.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow" />
                      </div>
                    )}
                    {/* Drag handle */}
                    <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-white/70" />
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(v)} title="Edit"
                        className="p-2 bg-white/10 hover:bg-[#ff6b00] rounded-lg transition-colors cursor-pointer">
                        <Pencil className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button onClick={() => toggleFeatured(v)} title={v.is_featured ? 'Unfeature' : 'Feature'}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${v.is_featured ? 'bg-yellow-500/80 hover:bg-yellow-500' : 'bg-white/10 hover:bg-yellow-500/80'}`}>
                        <Star className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button onClick={() => toggleStatus(v)} title={v.status === 'active' ? 'Disable' : 'Enable'}
                        className="p-2 bg-white/10 hover:bg-blue-500/80 rounded-lg transition-colors cursor-pointer">
                        {v.status === 'active' ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
                      </button>
                      <button onClick={() => handleDeleteVideo(v.id)} title="Delete"
                        className="p-2 bg-white/10 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                  {/* Caption */}
                  <div className="p-2 bg-white/5">
                    <p className="text-[10px] font-bold text-white truncate">{v.title}</p>
                    {v.category && <p className="text-[9px] text-gray-500 mt-0.5">{v.category}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Video</h3>
              <button onClick={closeEdit} className="p-1 hover:text-white text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Title</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Category</label>
                <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editFeatured" checked={editFeatured} onChange={e => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#ff6b00] cursor-pointer" />
                <label htmlFor="editFeatured" className="text-xs text-gray-300 cursor-pointer">Featured Video</label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSaveEdit} disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e55a00] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={closeEdit} className="px-4 py-2.5 text-xs text-gray-400 hover:text-white border border-white/10 rounded-xl transition-colors cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
