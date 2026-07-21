"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2, Plus, Trash2, CheckCircle, AlertCircle, Pencil,
  EyeOff, Eye, X, Save, Calendar, MapPin, Link2
} from 'lucide-react';
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

// Convert ISO/UTC date to datetime-local input value
function toDatetimeLocal(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventsEditor() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');

  // Edit modal
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRegLink, setEditRegLink] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');

  useEffect(() => { fetchEvents(); }, []);

  const showMsg = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate) return showMsg('error', 'Please pick a date and time.');
    setIsSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('events').insert([{
        title: title.trim(),
        description: description.trim(),
        event_date: new Date(eventDate).toISOString(),
        location: location.trim(),
        cover_image: coverImage || null,
        registration_link: registrationLink.trim() || null,
        status: 'active',
      }]);
      if (error) throw error;
      setTitle(''); setDescription(''); setEventDate(''); setLocation(''); setCoverImage(''); setRegistrationLink('');
      showMsg('success', 'Event published!');
      fetchEvents();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to publish.');
    } finally { setIsSaving(false); }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      showMsg('success', 'Event removed.');
      fetchEvents();
    } catch { showMsg('error', 'Failed to delete.'); }
  };

  const toggleStatus = async (ev: EventItem) => {
    try {
      await supabase.from('events').update({ status: ev.status === 'active' ? 'disabled' : 'active' }).eq('id', ev.id);
      fetchEvents();
    } catch { showMsg('error', 'Failed to update status.'); }
  };

  const openEdit = (ev: EventItem) => {
    setEditEvent(ev);
    setEditTitle(ev.title);
    setEditDescription(ev.description || '');
    setEditDate(toDatetimeLocal(ev.event_date));
    setEditLocation(ev.location || '');
    setEditRegLink(ev.registration_link || '');
    setEditCoverImage(ev.cover_image || '');
  };
  const closeEdit = () => setEditEvent(null);

  const handleSaveEdit = async () => {
    if (!editEvent) return;
    if (!editDate) return showMsg('error', 'Date is required.');
    setIsSaving(true);
    try {
      const { error } = await supabase.from('events').update({
        title: editTitle.trim(),
        description: editDescription.trim(),
        event_date: new Date(editDate).toISOString(),
        location: editLocation.trim(),
        registration_link: editRegLink.trim() || null,
        cover_image: editCoverImage || null,
      }).eq('id', editEvent.id);
      if (error) throw error;
      showMsg('success', 'Event updated.');
      closeEdit();
      fetchEvents();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to update.');
    } finally { setIsSaving(false); }
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return iso; }
  };

  const isPast = (iso: string) => new Date(iso) < new Date();

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Events Manager</h2>
        <p className="text-xs text-gray-400 mt-0.5">Schedule bootcamps, group sessions, and competitions.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="text-xs">{message.text}</span>
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={handleAddEvent} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Schedule New Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Event Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. Saturday Morning Power Bootcamp" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Date &amp; Time *</label>
            <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] [color-scheme:dark]" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Location / Venue *</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. Central Park Outdoor Zone, Nairobi" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Registration Link (optional)</label>
            <input type="url" value={registrationLink} onChange={e => setRegistrationLink(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="https://wa.me/..." />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] resize-none"
              placeholder="Event format, gear, what to expect..." />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Cover Image"
              value={coverImage}
              onChange={setCoverImage}
              folder="events"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => showMsg('error', msg)}
              onSuccess={msg => showMsg('success', msg)}
              placeholder="https://..."
            />
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e55a00] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Publish Event'}
        </button>
      </form>

      {/* Events List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scheduled Events ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No events scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map(ev => (
              <div key={ev.id} className={`flex bg-white/5 border rounded-xl overflow-hidden transition-colors ${isPast(ev.event_date) ? 'border-white/5 opacity-60' : 'border-white/10'}`}>
                {ev.cover_image && (
                  <div className="w-28 shrink-0">
                    <img src={ev.cover_image} alt={ev.title} className="w-full h-full object-cover"
                      onError={e => { (e.target as any).style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex-1 p-4 flex flex-col justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs">{ev.title}</h4>
                      {isPast(ev.event_date) && (
                        <span className="text-[8px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">Past</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#ff6b00]" />{formatDate(ev.event_date)}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#ff6b00]" />{ev.location}</span>
                    </div>
                    {ev.registration_link && (
                      <a href={ev.registration_link} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                        <Link2 className="w-3 h-3" /> Registration Link
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${ev.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700/50 text-gray-400'}`}>
                      {ev.status}
                    </span>
                    <button onClick={() => openEdit(ev)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-[#ff6b00]/20 text-gray-300 hover:text-white rounded-lg border border-white/5 cursor-pointer text-[10px] transition-colors">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => toggleStatus(ev)}
                      className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-gray-300 hover:text-white rounded-lg border border-white/5 cursor-pointer transition-colors">
                      {ev.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg cursor-pointer transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Event</h3>
              <button onClick={closeEdit} className="p-1 hover:text-white text-gray-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Title</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Date &amp; Time</label>
                <input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] [color-scheme:dark]" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Location</label>
                <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Registration Link</label>
                <input type="url" value={editRegLink} onChange={e => setEditRegLink(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                  placeholder="https://wa.me/..." />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] resize-none" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase">Cover Image URL</label>
                <input type="url" value={editCoverImage} onChange={e => setEditCoverImage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                  placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveEdit} disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e55a00] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
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
