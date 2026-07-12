"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [achievementDate, setAchievementDate] = useState('');

  useEffect(() => { fetchAchievements(); }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase.from('achievements').select('*').order('id', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) { setMessage({ type: 'error', text: 'Please provide or upload a certificate/badge image.' }); return; }
    setIsSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('achievements').insert([{
        title,
        description: description || null,
        image_url: imageUrl,
        achievement_date: achievementDate || null,
        status: 'active',
      }]);
      if (error) throw error;
      setTitle(''); setDescription(''); setImageUrl(''); setAchievementDate('');
      setMessage({ type: 'success', text: 'Achievement saved!' });
      fetchAchievements();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally { setIsSaving(false); }
  };

  const handleDeleteAchievement = async (id: number) => {
    if (!confirm('Delete this achievement?')) return;
    try {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Achievement deleted.' });
      fetchAchievements();
    } catch { setMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  const toggleStatus = async (id: number, status: string) => {
    try { await supabase.from('achievements').update({ status: status === 'active' ? 'disabled' : 'active' }).eq('id', id); fetchAchievements(); }
    catch (err) { console.error(err); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Achievements & Certifications</h2>
        <p className="text-xs text-gray-400">Upload coaching credentials, certifications, and training awards.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleAddAchievement} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register New Achievement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Credential / Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. Certified Kettlebell Master" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Awarding Date</label>
            <input type="date" value={achievementDate} onChange={e => setAchievementDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
              placeholder="Background and depth of this coaching certification." />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Certificate / Badge Image"
              value={imageUrl}
              onChange={setImageUrl}
              folder="achievements"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => setMessage({ type: 'error', text: msg })}
              onSuccess={msg => setMessage({ type: 'success', text: msg })}
            />
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading} className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer disabled:opacity-50">
          <Plus className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Achievement'}</span>
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Current Achievements ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No achievements saved.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                <div className="w-full h-28 bg-black">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2"
                    onError={e => { (e.target as any).src = '/images/logo.webp'; }} />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
                  {item.achievement_date && <p className="text-[10px] text-gray-400">Awarded: {item.achievement_date}</p>}
                  <div className="flex items-center space-x-2 pt-1">
                    <span className={`text-[9px] font-bold ${item.status === 'active' ? 'text-emerald-400' : 'text-gray-400'}`}>{item.status}</span>
                    <button onClick={() => toggleStatus(item.id, item.status)} className="flex-1 py-1 bg-black/40 text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer text-[10px]">Toggle</button>
                    <button onClick={() => handleDeleteAchievement(item.id)} className="p-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded cursor-pointer">
                      <Trash2 className="w-3 h-3" />
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
