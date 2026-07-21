"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Phone, Trash2, Check, ExternalLink } from 'lucide-react';

interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'pending' | 'responded' | 'disabled';
  created_at: string;
}

type FilterType = 'all' | 'pending' | 'responded';

export default function ContactEditor() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const markAsResponded = async (id: number) => {
    try {
      const { error } = await supabase.from('contact_requests').update({ status: 'responded' }).eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Inquiry marked as responded.' });
      fetchRequests();
    } catch { setMessage({ type: 'error', text: 'Failed to update status.' }); }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Delete this contact request?')) return;
    try {
      const { error } = await supabase.from('contact_requests').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Request removed.' });
      fetchRequests();
    } catch { setMessage({ type: 'error', text: 'Failed to delete request.' }); }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pending = requests.filter(r => r.status === 'pending').length;
  const responded = requests.filter(r => r.status === 'responded').length;

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Contact Inquiries</h2>
          <p className="text-xs text-gray-400 mt-0.5">View and respond to customer sign-up forms and message submissions.</p>
        </div>
        <div className="flex gap-2 text-[10px]">
          <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg font-bold">{pending} pending</span>
          <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold">{responded} responded</span>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl border text-xs ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 w-fit">
        {(['all', 'pending', 'responded'] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-bold capitalize transition-colors cursor-pointer ${filter === f ? 'bg-[#ff6b00] text-white' : 'bg-black/30 text-gray-400 hover:text-white'}`}>
            {f} {f === 'all' ? `(${requests.length})` : f === 'pending' ? `(${pending})` : `(${responded})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No {filter === 'all' ? '' : filter} contact requests.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(req => (
              <div key={req.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 relative hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{req.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Submitted: {new Date(req.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    req.status === 'pending'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>{req.status}</span>
                </div>

                <p className="text-xs text-gray-300 bg-black/30 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">{req.message}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 pt-1 border-t border-white/5">
                  <div className="flex items-center flex-wrap gap-3">
                    <a href={`mailto:${req.email}?subject=Re: Your Inquiry&body=Hi ${req.name},%0A%0A`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-[#ff6b00] hover:text-[#ff8c3a] transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{req.email}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                    {req.phone && (
                      <a href={`tel:${req.phone}`} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{req.phone}</span>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {req.status === 'pending' && (
                      <button onClick={() => markAsResponded(req.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5" /> Mark Responded
                      </button>
                    )}
                    <button onClick={() => deleteRequest(req.id)}
                      className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer">
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
