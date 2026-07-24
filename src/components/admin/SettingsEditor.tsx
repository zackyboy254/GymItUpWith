"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, AlertCircle, Copy, ClipboardCheck } from 'lucide-react';

interface SettingItem {
  key: string;
  value: string;
}

const GENERAL_SETTINGS_KEYS = [
  { key: 'contact_phone', label: 'Contact Phone Number', placeholder: 'e.g. +254 712 345 678' },
  { key: 'contact_whatsapp', label: 'WhatsApp URL / Number', placeholder: 'e.g. https://wa.me/254712345678' },
  { key: 'contact_email', label: 'Support Email Address', placeholder: 'e.g. info@gymitup.com' },
  { key: 'contact_address', label: 'Gym Physical Location / Address', placeholder: 'e.g. 5th Floor, Plaza Mall, Nairobi' },
  { key: 'social_instagram', label: 'Instagram URL', placeholder: 'e.g. https://instagram.com/gymitup' },
  { key: 'social_facebook', label: 'Facebook Page URL', placeholder: 'e.g. https://facebook.com/gymitup' },
  { key: 'social_tiktok', label: 'TikTok Profile URL', placeholder: 'e.g. https://tiktok.com/@gymitup' },
  { key: 'social_youtube', label: 'YouTube Channel URL', placeholder: 'e.g. https://youtube.com/@gymitup' },
];

const DEFAULT_SETTINGS_VALUES: Record<string, string> = {
  contact_phone: '',
  contact_whatsapp: '',
  contact_email: '',
  contact_address: '',
  social_instagram: '',
  social_facebook: '',
  social_tiktok: '',
  social_youtube: '',
};

const SQL_MIGRATION = `-- Run this in your Supabase SQL Editor to create the settings table:
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "Allow public read of settings" ON public.settings
    FOR SELECT TO public USING (true);

-- Create admin modify policy
CREATE POLICY "Allow admin manage of settings" ON public.settings
    FOR ALL TO authenticated USING (true);`;

export default function SettingsEditor() {
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>(DEFAULT_SETTINGS_VALUES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [missingTable, setMissingTable] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('settings')) {
          setMissingTable(true);
          return;
        }
        throw error;
      }

      const loadedSettings = { ...DEFAULT_SETTINGS_VALUES };
      data?.forEach((setting: SettingItem) => {
        if (setting.key in loadedSettings) {
          loadedSettings[setting.key] = setting.value;
        }
      });
      setSettingsValues(loadedSettings);
      setMissingTable(false);
    } catch (err) {
      console.warn('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (keysList: { key: string }[]) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = keysList.map((item) => ({
        key: item.key,
        value: (settingsValues[item.key] || '').trim(),
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'key' });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      fetchSettings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (missingTable) {
    return (
      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h3 className="text-base font-black uppercase tracking-wider">Database Setup Required</h3>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          The table <code>settings</code> does not exist in your Supabase database. Please copy the SQL below and execute it inside the <strong>SQL Editor</strong> on your Supabase dashboard to create the table.
        </p>
        <div className="relative bg-black/40 rounded-xl border border-white/10 p-4">
          <button onClick={copySQL} className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 text-white rounded transition-colors text-[10px] inline-flex items-center gap-1 cursor-pointer">
            {copied ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy SQL'}
          </button>
          <pre className="text-[10px] text-green-300 overflow-x-auto whitespace-pre font-mono pr-20 select-all">
            {SQL_MIGRATION}
          </pre>
        </div>
        <button onClick={fetchSettings} className="px-4 py-2 bg-[#FC6129] text-white rounded-lg text-xs font-bold hover:bg-[#d94d1e] cursor-pointer transition-colors">
          Reload Settings Table
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#FC6129] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">General Website Settings</h2>
        <p className="text-xs text-gray-400">Configure global metadata settings, social media handles, and support emails.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Global Contacts & Socials Settings */}
      <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact &amp; Social Information</h3>
        <p className="text-xs text-gray-400 font-medium">Configure global support details and social page links.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GENERAL_SETTINGS_KEYS.map((item) => (
            <div key={item.key} className="space-y-1">
              <label className="block text-[9px] text-gray-400 font-bold uppercase">{item.label}</label>
              <input
                type="text"
                value={settingsValues[item.key] || ''}
                placeholder={item.placeholder}
                onChange={(e) => setSettingsValues((prev) => ({ ...prev, [item.key]: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129]"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => handleSaveSettings(GENERAL_SETTINGS_KEYS)}
          disabled={isSaving}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FC6129] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Contact &amp; Social Info</span>
        </button>
      </div>
    </div>
  );
}
