"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Edit2, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoItem {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url?: string | null;
  category: 'workout' | 'tutorial' | 'transformation' | 'event';
  is_featured: boolean;
  status: 'active' | 'disabled';
}

const VIDEO_THUMBNAIL_FALLBACKS = [
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
];

const hashStringToIndex = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % VIDEO_THUMBNAIL_FALLBACKS.length;
};

const getYoutubeThumbnailFromUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const getAdminVideoThumbnail = (video: VideoItem) => {
  if (video.thumbnail_url) return video.thumbnail_url;
  return getYoutubeThumbnailFromUrl(video.video_url) || VIDEO_THUMBNAIL_FALLBACKS[hashStringToIndex(video.video_url || String(video.id))];
};

export default function VideosEditor() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<'workout' | 'tutorial' | 'transformation' | 'event'>('workout');
  const [isFeatured, setIsFeatured] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('gym-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('gym-images')
        .getPublicUrl(filePath);

      setUrl(publicUrl);
      setMessage({ type: 'success', text: 'Thumbnail uploaded successfully from device!' });
    } catch (err: any) {
      console.warn('Upload error:', err);
      setMessage({ type: 'error', text: `Upload failed: ${err.message}. Make sure Supabase storage policies allow authenticated inserts into 'gym-images'.` });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const generatedYoutubeThumbnail = getYoutubeThumbnailFromUrl(videoUrl);
    const finalThumbnail = thumbnailUrl.trim() || generatedYoutubeThumbnail || VIDEO_THUMBNAIL_FALLBACKS[hashStringToIndex(videoUrl)];

    try {
      const { error } = await supabase
        .from('videos')
        .insert([{
          title,
          video_url: videoUrl,
          thumbnail_url: finalThumbnail,
          category,
          is_featured: isFeatured,
          status: 'active'
        }]);

      if (error) throw error;

      setTitle('');
      setVideoUrl('');
      setThumbnailUrl('');
      setIsFeatured(false);
      setMessage({ type: 'success', text: 'Video uploaded successfully!' });
      fetchVideos();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save video.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVideo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Video deleted.' });
      fetchVideos();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete video.' });
    }
  };

  const toggleFeatured = async (id: number, currentVal: boolean) => {
    try {
      const { error } = await supabase.from('videos').update({ is_featured: !currentVal }).eq('id', id);
      if (error) throw error;
      fetchVideos();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const { error } = await supabase.from('videos').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
      fetchVideos();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Videos Manager</h2>
        <p className="text-xs text-gray-400">Post workout tutorials, transform clips, and feature fitness instruction guides.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAddVideo} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Publish New Video</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Video Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. Perfect Deadlift Form Guide"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Video URL (YouTube embed or direct link)</label>
            <input
              type="text"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Video Thumbnail Image</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/25 p-3 rounded-xl border border-white/5">
              <div className="space-y-1">
                <span className="block text-[8px] text-gray-500 font-bold uppercase">Option A: Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e, 'videos', setThumbnailUrl)}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-[#ff6b00]/10 file:text-[#ff6b00] hover:file:bg-[#ff6b00]/20 file:cursor-pointer cursor-pointer"
                  disabled={isUploading}
                />
                {isUploading && <p className="text-[10px] text-amber-400 animate-pulse mt-1">Uploading thumbnail to Supabase...</p>}
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] text-gray-500 font-bold uppercase">Option B: Enter thumbnail URL manually</span>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
            >
              <option value="workout">Workout</option>
              <option value="tutorial">Tutorial</option>
              <option value="transformation">Transformation</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={isFeatured}
            onChange={e => setIsFeatured(e.target.checked)}
            className="rounded border-white/10 bg-black text-[#ff6b00]"
          />
          <label htmlFor="isFeatured" className="text-xs text-gray-300 font-medium">Pin this video as Featured on home page</label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Video</span>
        </button>
      </form>

      {/* Videos List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Uploaded Videos ({videos.length})</h3>
        {videos.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No videos created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {videos.map(video => (
              <div key={video.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-black border border-white/10 rounded overflow-hidden shrink-0 relative">
                    <img
                      src={getAdminVideoThumbnail(video)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as any).src = VIDEO_THUMBNAIL_FALLBACKS[hashStringToIndex(video.video_url || String(video.id))]; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                        <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white leading-tight">{video.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                        {video.category}
                      </span>
                      {video.is_featured && (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                          ★ Featured
                        </span>
                      )}
                      <span className={`text-[10px] font-bold ${video.status === 'active' ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {video.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFeatured(video.id, video.is_featured)}
                    className="px-2 py-1 bg-black/40 text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer"
                  >
                    ★ Feature
                  </button>
                  <button
                    onClick={() => toggleStatus(video.id, video.status)}
                    className="px-2 py-1 bg-black/40 text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer"
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
