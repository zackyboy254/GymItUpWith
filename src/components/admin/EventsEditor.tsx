"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface EventItem {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  cover_image?: string;
  registration_link?: string;
  status: 'active' | 'disabled';
}

export default function EventsEditor() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('id', { ascending: false });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('events').insert([{
        title,
        description,
        event_date: new Date(eventDate).toISOString(),
        location,
        cover_image: coverImage || null,
        registration_link: registrationLink || null,
        status: 'active',
      }]);
      if (error) throw error;
      setTitle(''); setDescription(''); setEventDate(''); setLocation(''); setCoverImage(''); setRegistrationLink('');
      setMessage({ type: 'success', text: 'Event published!' });
      fetchEvents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to publish.' });
    } finally { setIsSaving(false); }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Event removed.' });
      fetchEvents();
    } catch { setMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  const toggleStatus = async (id: number, status: string) => {
    try { await supabase.from('events').update({ status: status === 'active' ? 'disabled' : 'active' }).eq('id', id); fetchEvents(); }
    catch (err) { console.error(err); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Fitness Events Planner</h2>
        <p className="text-xs text-gray-400">Schedule group workouts, outdoor sessions, and bootcamp announcements.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleAddEvent} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Schedule New Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Event Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. Saturday Morning Power Bootcamp" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Date & Time</label>
            <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Location / Venue</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              placeholder="e.g. Central Park Outdoor Zone" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Registration Link (WhatsApp / external)</label>
            <input type="text" value={registrationLink} onChange={e => setRegistrationLink(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              placeholder="https://wa.me/..." />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              placeholder="Event format, gear, schedule, etc." />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Cover Image"
              value={coverImage}
              onChange={setCoverImage}
              folder="events"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => setMessage({ type: 'error', text: msg })}
              onSuccess={msg => setMessage({ type: 'success', text: msg })}
              placeholder="https://..."
            />
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading} className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer disabled:opacity-50">
          <Plus className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Publish Event'}</span>
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scheduled Events ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No events scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map(event => (
              <div key={event.id} className="flex bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                {event.cover_image && (
                  <div className="w-28 shrink-0">
                    <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" onError={e => { (e.target as any).style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex-1 p-3 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-bold text-white text-xs">{event.title}</h4>
                    <p className="text-[10px] text-[#ff6b00] mt-0.5">{new Date(event.event_date).toLocaleString()} @ {event.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-bold ${event.status === 'active' ? 'text-emerald-400' : 'text-gray-400'}`}>{event.status}</span>
                    <button onClick={() => toggleStatus(event.id, event.status)} className="px-2 py-0.5 bg-black/40 text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer text-[10px]">Toggle</button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="p-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded cursor-pointer">
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
