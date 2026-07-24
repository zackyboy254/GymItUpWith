"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2, Plus, Trash2, CheckCircle, AlertCircle, Pencil,
  EyeOff, Eye, X, Save, Award
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface AchievementItem {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  achievement_date?: string;
  status: 'active' | 'disabled';
}

export default function AchievementsEditor() {
  const [items, setItems] = useState<AchievementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [achievementDate, setAchievementDate] = useState('');

  // Edit modal
  const [editItem, setEditItem] = useState<AchievementItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isEditUploading, setIsEditUploading] = useState(false);

  useEffect(() => { fetchAchievements(); }, []);

  const showMsg = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('achievements').select('*').order('id', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return showMsg('error', 'Please upload or provide an image.');
    setIsSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('achievements').insert([{
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
        achievement_date: achievementDate || null,
        status: 'active',
      }]);
      if (error) throw error;
      setTitle(''); setDescription(''); setImageUrl(''); setAchievementDate('');
      showMsg('success', 'Achievement saved!');
      fetchAchievements();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to save.');
    } finally { setIsSaving(false); }
  };

  const handleDeleteAchievement = async (id: number) => {
    if (!confirm('Delete this achievement?')) return;
    try {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) throw error;
      showMsg('success', 'Achievement deleted.');
      fetchAchievements();
    } catch { showMsg('error', 'Failed to delete.'); }
  };

  const toggleStatus = async (item: AchievementItem) => {
    try {
      await supabase.from('achievements').update({ status: item.status === 'active' ? 'disabled' : 'active' }).eq('id', item.id);
      fetchAchievements();
    } catch { showMsg('error', 'Failed to update status.'); }
  };

  const openEdit = (item: AchievementItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditDate(item.achievement_date || '');
    setEditImage(item.image_url);
  };
  const closeEdit = () => setEditItem(null);

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('achievements').update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        achievement_date: editDate || null,
        image_url: editImage,
      }).eq('id', editItem.id);
      if (error) throw error;
      showMsg('success', 'Achievement updated.');
      closeEdit();
      fetchAchievements();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to update.');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#FC6129] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Achievements &amp; Certifications</h2>
        <p className="text-xs text-gray-400 mt-0.5">Upload coaching credentials, certifications, and training awards.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="text-xs">{message.text}</span>
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={handleAddAchievement} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Achievement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Credential / Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129]"
              placeholder="e.g. Certified Kettlebell Master" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Awarding Date</label>
            <input type="date" value={achievementDate} onChange={e => setAchievementDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129] [color-scheme:dark]" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129] resize-none"
              placeholder="Background and depth of this coaching certification." />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Certificate / Badge Image *"
              value={imageUrl}
              onChange={setImageUrl}
              folder="achievements"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => showMsg('error', msg)}
              onSuccess={msg => showMsg('success', msg)}
            />
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#FC6129] hover:bg-[#d94d1e] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Achievement'}
        </button>
      </form>

      {/* Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Achievements ({items.length})</h3>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl text-gray-500 space-y-2">
            <Award className="w-10 h-10" />
            <p className="text-xs">No achievements added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/20">
                <div className="aspect-square bg-black/40 relative">
                  <img src={item.image_url} alt={item.title}
                    className="w-full h-full object-contain p-2"
                    onError={e => { (e.target as any).src = '/images/gymituplogo.png'; }} />
                  <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                    item.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-gray-700/90 text-gray-300'
                  }`}>{item.status}</div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(item)} title="Edit"
                      className="p-2 bg-white/10 hover:bg-[#FC6129] rounded-lg transition-colors cursor-pointer">
                      <Pencil className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button onClick={() => toggleStatus(item)} title={item.status === 'active' ? 'Disable' : 'Enable'}
                      className="p-2 bg-white/10 hover:bg-blue-500/80 rounded-lg transition-colors cursor-pointer">
                      {item.status === 'active' ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <button onClick={() => handleDeleteAchievement(item.id)} title="Delete"
                      className="p-2 bg-white/10 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-bold text-white truncate">{item.title}</p>
                  {item.achievement_date && <p className="text-[9px] text-gray-500">{item.achievement_date}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Achievement</h3>
              <button onClick={closeEdit} className="p-1 hover:text-white text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Title</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129]" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Awarding Date</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129] [color-scheme:dark]" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129] resize-none" />
              </div>
              <ImageUploadField
                label="Certificate / Badge Image"
                value={editImage}
                onChange={setEditImage}
                folder="achievements"
                isUploading={isEditUploading}
                setIsUploading={setIsEditUploading}
                onError={msg => showMsg('error', msg)}
                onSuccess={msg => showMsg('success', msg)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveEdit} disabled={isSaving || isEditUploading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[#FC6129] hover:bg-[#d94d1e] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button onClick={closeEdit} className="px-4 py-2.5 text-xs text-gray-400 hover:text-white border border-white/10 rounded-xl transition-colors cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
