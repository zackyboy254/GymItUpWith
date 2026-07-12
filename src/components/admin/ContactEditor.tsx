"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Phone, Trash2, Check } from 'lucide-react';

interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'pending' | 'responded' | 'disabled';
  created_at: string;
}

export default function ContactEditor() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsResponded = async (id: number) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: 'responded' })
        .eq('id', id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Inquiry marked as responded.' });
      fetchRequests();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status.' });
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact request?')) return;
    try {
      const { error } = await supabase
        .from('contact_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Request removed.' });
      fetchRequests();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete request.' });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Contact Inquiries</h2>
        <p className="text-xs text-gray-400">View and respond to customer sign-up forms and message submissions.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl border text-xs ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No contact requests submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map(req => (
              <div key={req.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{req.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Submitted: {new Date(req.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    req.status === 'pending' 
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <p className="text-xs text-gray-300 bg-black/30 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {req.message}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 pt-1 border-t border-white/5">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-[#ff6b00]" />
                      <span>{req.email}</span>
                    </span>
                    {req.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-[#0077ff]" />
                        <span>{req.phone}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => markAsResponded(req.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Responded</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Delete Request"
                    >
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
