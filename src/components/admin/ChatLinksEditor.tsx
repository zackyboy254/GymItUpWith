"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';

interface ChatLinkItem {
  id: number;
  type: 'chatbot' | 'whatsapp' | 'phone';
  url: string;
  order: number;
}

export default function ChatLinksEditor() {
  const [links, setLinks] = useState<ChatLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [type, setType] = useState<'chatbot' | 'whatsapp' | 'phone'>('whatsapp');
  const [url, setUrl] = useState('');

  const [missingTable, setMissingTable] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_links')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205') {
          setMissingTable(true);
          return;
        }
        throw error;
      }
      setLinks(data || []);
    } catch (err) {
      console.warn('Error fetching chat links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const nextOrder = links.length > 0 ? Math.max(...links.map(l => l.order)) + 1 : 0;

    try {
      const { error } = await supabase
        .from('chat_links')
        .insert([{
          type,
          url,
          order: nextOrder
        }]);

      if (error) throw error;

      setUrl('');
      setMessage({ type: 'success', text: 'Chat link registered successfully!' });
      fetchLinks();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save link.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm('Are you sure you want to delete this chat link?')) return;
    try {
      const { error } = await supabase.from('chat_links').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Link deleted.' });
      fetchLinks();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete link.' });
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
          The table <code>chat_links</code> does not exist in your Supabase database. Please copy the contents of the database schema file and execute it in your Supabase SQL Editor.
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
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Chat & Contact Widget Links</h2>
        <p className="text-xs text-gray-400">Configure redirect routes for Floating Chat Widget channels, WhatsApp links, or Phone numbers.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAddLink} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register Widget Channel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Channel Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
            >
              <option value="whatsapp">WhatsApp API Link</option>
              <option value="chatbot">AI Chatbot API</option>
              <option value="phone">Direct Call / Phone Number</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Link URL / Number</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. https://wa.me/2547..."
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Save Channel</span>
        </button>
      </form>

      {/* List channels */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Contact Widget Links ({links.length})</h3>
        {links.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No chat widget links saved.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {links.map(link => (
              <div key={link.id} className="flex space-x-4 p-3 bg-white/5 border border-white/5 rounded-xl text-xs items-center justify-between">
                <div>
                  <h4 className="font-bold text-white leading-tight capitalize">{link.type} Link</h4>
                  <p className="text-[10px] text-gray-400 mt-1 truncate max-w-md">{link.url}</p>
                </div>

                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
