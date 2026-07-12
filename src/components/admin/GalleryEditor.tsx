"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: 'transformations' | 'gym_sessions' | 'events' | 'competitions';
  status: 'active' | 'disabled';
}

export default function GalleryEditor() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<'transformations' | 'gym_sessions' | 'events' | 'competitions'>('transformations');

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase.from('gallery').select('*').order('id', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) { setMessage({ type: 'error', text: 'Please provide an image URL or upload from device.' }); return; }
    setIsSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('gallery').insert([{ title, image_url: imageUrl, category, status: 'active' }]);
      if (error) throw error;
      setTitle('');
      setImageUrl('');
      setMessage({ type: 'success', text: 'Gallery item added!' });
      fetchGallery();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally { setIsSaving(false); }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this gallery item?')) return;
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Item deleted.' });
      fetchGallery();
    } catch { setMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  const toggleStatus = async (id: number, status: string) => {
    try {
      await supabase.from('gallery').update({ status: status === 'active' ? 'disabled' : 'active' }).eq('id', id);
      fetchGallery();
    } catch (err) { console.error(err); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Gallery Manager</h2>
        <p className="text-xs text-gray-400">Upload transformation photos, gym sessions, events, and competitions.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleAddItem} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Publish New Gallery Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Image Title / Caption</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. 3-Month Body Transformation"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
            >
              <option value="transformations">Transformations</option>
              <option value="gym_sessions">Gym Sessions</option>
              <option value="events">Events</option>
              <option value="competitions">Competitions</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Gallery Photo"
              value={imageUrl}
              onChange={setImageUrl}
              folder="gallery"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => setMessage({ type: 'error', text: msg })}
              onSuccess={msg => setMessage({ type: 'success', text: msg })}
            />
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading} className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer disabled:opacity-50">
          <Plus className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Add Media Item'}</span>
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Gallery Media ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No gallery items found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden group">
                <div className="w-full h-36 bg-black relative">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as any).src = 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=60'; }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500/80 text-white' : 'bg-gray-600/80 text-gray-300'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
                  <p className="text-[10px] text-[#ff6b00] font-semibold capitalize">{item.category.replace('_', ' ')}</p>
                  <div className="flex items-center space-x-2 pt-1">
                    <button onClick={() => toggleStatus(item.id, item.status)} className="flex-1 py-1 bg-black/40 text-gray-300 hover:text-white rounded text-[10px] border border-white/5 cursor-pointer">
                      Toggle
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
