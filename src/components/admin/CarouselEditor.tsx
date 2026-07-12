"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, AlertCircle, CheckCircle, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface CarouselSlide {
  id?: number;
  image_id: string;
  caption?: string;
  order: number;
  created_at?: string;
}

export default function CarouselEditor() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newImageId, setNewImageId] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [missingTable, setMissingTable] = useState(false);

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
      setMessage({ type: 'success', text: 'Image uploaded successfully from device!' });
    } catch (err: any) {
      console.warn('Upload error:', err);
      setMessage({ type: 'error', text: `Upload failed: ${err.message}. Make sure Supabase storage policies allow authenticated inserts into 'gym-images'.` });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205') {
          setMissingTable(true);
          return;
        }
        throw error;
      }
      setSlides(data || []);
    } catch (err: any) {
      console.warn('Error fetching slides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageId) return;

    setIsSaving(true);
    setMessage(null);

    const nextOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) + 1 : 0;

    try {
      const { error } = await supabase
        .from('carousel_slides')
        .insert([{
          image_id: newImageId,
          caption: newCaption,
          order: nextOrder
        }]);

      if (error) throw error;
      
      setNewImageId('');
      setNewCaption('');
      setMessage({ type: 'success', text: 'Slide added successfully!' });
      fetchSlides();
    } catch (err: any) {
      console.error('Error adding slide:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to add slide.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlide = async (id: number) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const { error } = await supabase
        .from('carousel_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Slide removed.' });
      fetchSlides();
    } catch (err: any) {
      console.error('Error deleting slide:', err);
      setMessage({ type: 'error', text: 'Failed to remove slide.' });
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index].order;
    newSlides[index].order = newSlides[targetIndex].order;
    newSlides[targetIndex].order = temp;

    setSlides(newSlides);

    try {
      // Batch update the order in Supabase
      const { error: err1 } = await supabase
        .from('carousel_slides')
        .update({ order: newSlides[index].order })
        .eq('id', newSlides[index].id);

      const { error: err2 } = await supabase
        .from('carousel_slides')
        .update({ order: newSlides[targetIndex].order })
        .eq('id', newSlides[targetIndex].id);

      if (err1 || err2) throw err1 || err2;
      fetchSlides();
    } catch (err) {
      console.error('Error swapping slide order:', err);
    }
  };

  if (missingTable) {
    return (
      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h3 className="text-base font-black uppercase tracking-wider">Database Setup Required</h3>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          The table <code>carousel_slides</code> does not exist in your Supabase database. Please copy the contents of the database schema file and execute it in your Supabase SQL Editor.
        </p>
        <div className="bg-black/35 p-3 rounded-xl border border-white/5 space-y-1">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Migration Script Path</p>
          <code className="text-xs text-white select-all block break-all">
            supabase/migrations/20240712_add_content_tables.sql
          </code>
        </div>
      </div>
    );
  }

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
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Hero Carousel Images</h2>
        <p className="text-xs text-gray-400">Add, rearrange, or delete background slide images displayed behind the main landing page content.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Add Slide Form */}
      <form onSubmit={handleAddSlide} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Background Slide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Background Slide Image</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/25 p-3 rounded-xl border border-white/5">
              <div className="space-y-1">
                <span className="block text-[8px] text-gray-500 font-bold uppercase">Option A: Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e, 'carousel', setNewImageId)}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-[#ff6b00]/10 file:text-[#ff6b00] hover:file:bg-[#ff6b00]/20 file:cursor-pointer cursor-pointer"
                  disabled={isUploading}
                />
                {isUploading && <p className="text-[10px] text-amber-400 animate-pulse mt-1">Uploading slide to Supabase...</p>}
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] text-gray-500 font-bold uppercase">Option B: Enter image URL manually</span>
                <input
                  type="text"
                  value={newImageId}
                  onChange={e => setNewImageId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Caption / Label (optional)</label>
            <input
              type="text"
              value={newCaption}
              onChange={e => setNewCaption(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. Active training session"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Slide</span>
        </button>
      </form>

      {/* List of current slides */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Slides ({slides.length})</h3>
        {slides.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No slides added yet. Standard landing page images are used as fallback.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {slides.map((slide, idx) => (
              <div key={slide.id} className="flex items-center space-x-4 p-3 bg-white/5 border border-white/5 rounded-xl">
                {/* Preview Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
                  <img
                    src={slide.image_id}
                    alt={slide.caption || "Slide preview"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=100&q=40';
                    }}
                  />
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-lg">{slide.image_id}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-1">
                    {slide.caption ? `Caption: "${slide.caption}"` : 'No caption'}
                  </p>
                </div>
                {/* Order controls & delete button */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveSlide(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-black/40 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSlide(idx, 'down')}
                    disabled={idx === slides.length - 1}
                    className="p-1.5 rounded-lg bg-black/40 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => slide.id && handleDeleteSlide(slide.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer ml-2"
                    title="Delete Slide"
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
