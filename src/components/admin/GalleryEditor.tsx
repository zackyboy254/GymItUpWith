"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2, Plus, Trash2, CheckCircle, AlertCircle, Pencil,
  EyeOff, Eye, GripVertical, Upload, X, Save, ImageIcon
} from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: 'transformations' | 'gym_sessions' | 'events' | 'competitions';
  status: 'active' | 'disabled';
  sort_order: number;
}

const CATEGORIES = [
  { value: 'transformations', label: 'Transformations' },
  { value: 'gym_sessions', label: 'Gym Sessions' },
  { value: 'events', label: 'Events' },
  { value: 'competitions', label: 'Competitions' },
];

export default function GalleryEditor() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMigrationNote, setShowMigrationNote] = useState(false);

  // Add form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryItem['category']>('transformations');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<GalleryItem['category']>('transformations');

  // Drag
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  useEffect(() => { fetchGallery(); }, []);

  const showMsg = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('gallery').select('*').order('sort_order', { ascending: true });
      if (error) {
        if (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('sort_order')) {
          setShowMigrationNote(true);
          const fallback = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
          if (!fallback.error) setItems(fallback.data || []);
          return;
        }
        throw error;
      }
      setItems(data || []);
    } catch (err) { console.error('fetchGallery error:', err); }
    finally { setIsLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return showMsg('error', 'Please select an image file.');
    if (!title.trim()) return showMsg('error', 'Caption/title is required.');

    setIsSaving(true);
    setIsUploading(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, imageFile, { upsert: false, contentType: imageFile.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
      const maxOrder = items.length > 0 ? Math.max(...items.map(v => v.sort_order)) : 0;

      const { error } = await supabase.from('gallery').insert([{
        title: title.trim(),
        image_url: urlData.publicUrl,
        category,
        status: 'active',
        sort_order: maxOrder + 1,
      }]);
      if (error) throw error;

      setTitle(''); setImageFile(null); setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      showMsg('success', 'Photo added to gallery!');
      fetchGallery();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to upload.');
    } finally { setIsSaving(false); setIsUploading(false); }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this gallery item?')) return;
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      showMsg('success', 'Item deleted.');
      fetchGallery();
    } catch { showMsg('error', 'Failed to delete.'); }
  };

  const toggleStatus = async (item: GalleryItem) => {
    try {
      await supabase.from('gallery').update({ status: item.status === 'active' ? 'disabled' : 'active' }).eq('id', item.id);
      fetchGallery();
    } catch { showMsg('error', 'Failed to update status.'); }
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
  };
  const closeEdit = () => setEditItem(null);

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('gallery').update({ title: editTitle.trim(), category: editCategory }).eq('id', editItem.id);
      if (error) throw error;
      showMsg('success', 'Gallery item updated.');
      closeEdit();
      fetchGallery();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to update.');
    } finally { setIsSaving(false); }
  };

  const handleDragStart = (id: number) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, id: number) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (dragId === null || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const reordered = [...items];
    const fromIdx = reordered.findIndex(v => v.id === dragId);
    const toIdx = reordered.findIndex(v => v.id === targetId);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((v, i) => ({ ...v, sort_order: i + 1 }));
    setItems(updated);
    setDragId(null); setDragOverId(null);
    try {
      await Promise.all(updated.map(v => supabase.from('gallery').update({ sort_order: v.sort_order }).eq('id', v.id)));
    } catch { showMsg('error', 'Failed to save order.'); fetchGallery(); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Gallery Manager</h2>
          <p className="text-xs text-gray-400 mt-0.5">Upload photos from your device. Drag cards to reorder.</p>
        </div>
        <span className="text-[10px] text-gray-500 bg-white/5 border border-white/10 rounded-lg px-2 py-1">{items.length} photos</span>
      </div>

      {showMigrationNote && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3">
          <p className="text-xs font-bold">⚠ Database migration needed — run this SQL in Supabase SQL Editor:</p>
          <pre className="text-[10px] bg-black/40 rounded p-3 overflow-x-auto select-all text-green-300">{`ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
UPDATE gallery SET sort_order = id WHERE sort_order = 0;`}</pre>
          <button onClick={() => { setShowMigrationNote(false); fetchGallery(); }} className="text-[10px] text-amber-400 underline">Dismiss (run first)</button>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="text-xs">{message.text}</span>
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={handleAddItem} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Photo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Caption / Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. 3-Month Transformation" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as GalleryItem['category'])}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] cursor-pointer">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Photo File *</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ff6b00] file:text-white cursor-pointer" />
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="h-32 rounded-xl object-cover mt-2 border border-white/10" />
            )}
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e55a00] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
          {isSaving || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Add to Gallery'}
        </button>
      </form>

      {/* Gallery Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gallery Photos ({items.length})</h3>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl text-gray-500 space-y-2">
            <ImageIcon className="w-10 h-10" />
            <p className="text-xs">No photos added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={e => handleDragOver(e, item.id)}
                onDrop={e => handleDrop(e, item.id)}
                onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                className={`group relative rounded-xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                  dragOverId === item.id ? 'border-[#ff6b00] scale-95' : 'border-white/10'
                } ${dragId === item.id ? 'opacity-40' : 'opacity-100'}`}
              >
                <div className="aspect-square bg-black/60 relative">
                  <img src={item.image_url} alt={item.title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as any).src = 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=60'; }} />
                  <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                    item.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-gray-700/90 text-gray-300'
                  }`}>{item.status}</div>
                  <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white/70" />
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(item)} title="Edit" className="p-2 bg-white/10 hover:bg-[#ff6b00] rounded-lg transition-colors cursor-pointer">
                      <Pencil className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button onClick={() => toggleStatus(item)} title={item.status === 'active' ? 'Disable' : 'Enable'}
                      className="p-2 bg-white/10 hover:bg-blue-500/80 rounded-lg transition-colors cursor-pointer">
                      {item.status === 'active' ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} title="Delete"
                      className="p-2 bg-white/10 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-white/5">
                  <p className="text-[10px] font-bold text-white truncate">{item.title}</p>
                  <p className="text-[9px] text-[#ff6b00] mt-0.5 capitalize">{item.category.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Photo</h3>
              <button onClick={closeEdit} className="p-1 hover:text-white text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <img src={editItem.image_url} alt={editItem.title} className="w-full h-32 object-cover rounded-xl border border-white/10" />
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Caption</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Category</label>
                <select value={editCategory} onChange={e => setEditCategory(e.target.value as GalleryItem['category'])}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] cursor-pointer">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveEdit} disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e55a00] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
              <button onClick={closeEdit} className="px-4 py-2.5 text-xs text-gray-400 hover:text-white border border-white/10 rounded-xl transition-colors cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
