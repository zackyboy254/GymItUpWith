"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface PopupItem {
  id: number;
  title: string;
  message: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  popup_type?: string;
  day_of_week?: string | null;
  scheduled_date?: string | null;
  status: 'active' | 'disabled';
}

export default function PopupsEditor() {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [title, setTitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [popupType, setPopupType] = useState('motivation');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => { fetchPopups(); }, []);

  const fetchPopups = async () => {
    try {
      const { data, error } = await supabase.from('daily_popups').select('*').order('id', { ascending: false });
      if (error) throw error;
      setPopups(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAddPopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('daily_popups').insert([{
        title,
        message: bodyText,
        cta_text: ctaText || null,
        cta_link: ctaLink || null,
        image_url: imageUrl || null,
        popup_type: popupType || 'motivation',
        day_of_week: dayOfWeek || null,
        scheduled_date: scheduledDate || null,
        status: 'active',
      }]);
      if (error) throw error;
      setTitle(''); setBodyText(''); setCtaText(''); setCtaLink(''); setImageUrl(''); setPopupType('motivation'); setDayOfWeek(''); setScheduledDate('');
      setMessage({ type: 'success', text: 'Popup configured and saved!' });
      fetchPopups();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally { setIsSaving(false); }
  };

  const handleDeletePopup = async (id: number) => {
    if (!confirm('Delete this popup?')) return;
    try {
      const { error } = await supabase.from('daily_popups').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Popup removed.' });
      fetchPopups();
    } catch { setMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  const toggleStatus = async (id: number, status: string) => {
    try { await supabase.from('daily_popups').update({ status: status === 'active' ? 'disabled' : 'active' }).eq('id', id); fetchPopups(); }
    catch (err) { console.error(err); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Site Popups & Promotions</h2>
        <p className="text-xs text-gray-400">Create offers and announcements that appear on visitor landing.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleAddPopup} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configure New Popup</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Popup Headline</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. 🔥 First Session FREE!" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Popup Type</label>
            <select value={popupType} onChange={e => setPopupType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white">
              <option value="motivation">Motivation</option>
              <option value="tip">Tip</option>
              <option value="promo">Promo</option>
              <option value="event">Event</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Day Of Week (optional)</label>
            <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white">
              <option value="">Any</option>
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Scheduled Date (optional)</label>
            <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Message Body</label>
            <textarea value={bodyText} onChange={e => setBodyText(e.target.value)} rows={2} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white"
              placeholder="e.g. Sign up before midnight and claim a free personal training session." />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">CTA Button Text</label>
            <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white"
              placeholder="Claim Offer" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">CTA Link / WhatsApp URL</label>
            <input type="text" value={ctaLink} onChange={e => setCtaLink(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white"
              placeholder="https://wa.me/..." />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Optional Popup Banner Image"
              value={imageUrl}
              onChange={setImageUrl}
              folder="popups"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => setMessage({ type: 'error', text: msg })}
              onSuccess={msg => setMessage({ type: 'success', text: msg })}
              placeholder="Leave blank for text-only popup"
            />
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading} className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer disabled:opacity-50">
          <Plus className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Popup'}</span>
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configured Popups ({popups.length})</h3>
        {popups.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No popups configured.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {popups.map(popup => (
              <div key={popup.id} className="flex bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                {popup.image_url && (
                  <div className="w-24 shrink-0">
                    <img src={popup.image_url} alt={popup.title} className="w-full h-full object-cover" onError={e => { (e.target as any).style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex-1 p-3 space-y-1.5">
                  <p className="font-bold text-white text-xs">{popup.title}</p>
                  <p className="text-[10px] text-gray-400">{popup.message}</p>
                  <p className="text-[10px] text-gray-500">Day: {popup.day_of_week || 'Any'} · CTA: {popup.cta_text || 'None'}</p>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className={`text-[9px] font-bold ${popup.status === 'active' ? 'text-emerald-400' : 'text-gray-400'}`}>{popup.status}</span>
                    <button onClick={() => toggleStatus(popup.id, popup.status)} className="px-2 py-0.5 bg-black/40 text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer text-[10px]">Toggle</button>
                    <button onClick={() => handleDeletePopup(popup.id)} className="p-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded cursor-pointer">
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
