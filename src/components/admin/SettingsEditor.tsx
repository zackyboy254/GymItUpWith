"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

interface SettingItem {
  key: string;
  value: string;
}

export default function SettingsEditor() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const [missingTable, setMissingTable] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205') {
          setMissingTable(true);
          return;
        }
        throw error;
      }
      setSettings(data || []);
    } catch (err) {
      console.warn('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newValue) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('settings')
        .upsert([{
          key: newKey.trim().toLowerCase(),
          value: newValue.trim()
        }]);

      if (error) throw error;

      setNewKey('');
      setNewValue('');
      setMessage({ type: 'success', text: 'Setting saved successfully!' });
      fetchSettings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save setting.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the setting: "${key}"?`)) return;
    try {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('key', key);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Setting deleted.' });
      fetchSettings();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete setting.' });
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
          The table <code>settings</code> does not exist in your Supabase database. Please copy the contents of the database schema file and execute it in your Supabase SQL Editor.
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
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">General Website Settings</h2>
        <p className="text-xs text-gray-400">Configure global metadata settings, social media handles, support emails, and training metrics.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSaveSetting} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Save Setting (Key-Value)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Setting Key (e.g. contact_email)</label>
            <input
              type="text"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. support_phone"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Setting Value</label>
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. +254 712 345 678"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Setting</span>
        </button>
      </form>

      {/* List settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registered Global Constants ({settings.length})</h3>
        {settings.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No settings saved.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {settings.map(setting => (
              <div key={setting.key} className="flex space-x-4 p-3 bg-white/5 border border-white/5 rounded-xl text-xs items-center justify-between">
                <div className="min-w-0">
                  <span className="font-bold text-[#ff6b00] uppercase tracking-wider text-[10px] block">{setting.key}</span>
                  <span className="text-gray-300 font-medium truncate block max-w-lg mt-0.5">{setting.value}</span>
                </div>

                <button
                  onClick={() => handleDeleteSetting(setting.key)}
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
