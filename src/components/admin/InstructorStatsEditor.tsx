"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, AlertCircle, CheckCircle, Copy, ClipboardCheck } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface SettingItem {
  key: string;
  value: string;
}

const METRIC_KEYS = [
  { key: 'metric_years', label: 'Years Stat', placeholder: 'e.g. 12+' },
  { key: 'metric_members', label: 'Members Stat', placeholder: 'e.g. 27K+' },
  { key: 'metric_weekly_classes', label: 'Weekly Classes Stat', placeholder: 'e.g. 60+' },
  { key: 'metric_trainers', label: 'Trainers Stat', placeholder: 'e.g. 117+' },
  { key: 'metric_experience', label: 'Training Experience Stat', placeholder: 'e.g. 5+ Years' },
  { key: 'metric_happy_clients', label: 'Happy Clients Stat', placeholder: 'e.g. 200+' },
  { key: 'metric_success_rate', label: 'Success Rate Stat', placeholder: 'e.g. 98%' },
  { key: 'metric_certifications', label: 'Certifications Stat', placeholder: 'e.g. 15+' },
];

const INSTRUCTOR_KEYS = [
  { key: 'instructor_name', label: 'Instructor Name', placeholder: 'e.g. Coach Billy 💪' },
  { key: 'instructor_title', label: 'Instructor Title/Role', placeholder: 'e.g. Certified Fitness Coach' },
  { key: 'instructor_quote', label: 'Instructor Inspirational Quote', placeholder: 'e.g. "Fitness is not a destination..."' },
  { key: 'instructor_heading', label: 'Biography Section Heading', placeholder: 'e.g. Fueling Fitness Excellence 🏆' },
];

const DEFAULT_VALUES: Record<string, string> = {
  metric_years: '12+',
  metric_members: '27K+',
  metric_weekly_classes: '60+',
  metric_trainers: '117+',
  metric_experience: '5+ Years',
  metric_happy_clients: '200+',
  metric_success_rate: '98%',
  metric_certifications: '15+',
  instructor_name: 'Coach Billy 💪',
  instructor_title: 'Certified Fitness Coach',
  instructor_quote: '"Fitness is not a destination; it\'s a way of living. I\'m here to equip you with the mindset, routines, and discipline to transform your life."',
  instructor_image: '/images/gym6.jpg',
  instructor_heading: 'Fueling Fitness Excellence 🏆',
  instructor_bio_p1: 'Coach Billy is a premier certified fitness instructor with years of experience pushing clients to achieve their target physiques. Billy combines scientific training methodologies, functional movement principles, and highly structured nutritional guidelines.',
  instructor_bio_p2: 'Whether you\'re looking to shed fat, build lean muscle, prepare for a marathon, or improve overall cardio endurance, the training programs here are optimized for sustainable results.',
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

export default function InstructorStatsEditor() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_VALUES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [missingTable, setMissingTable] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const showMsg = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('settings')) {
          setMissingTable(true);
          return;
        }
        throw error;
      }

      const loadedValues = { ...DEFAULT_VALUES };
      data?.forEach((item: SettingItem) => {
        loadedValues[item.key] = item.value;
      });
      setSettings(loadedValues);
      setMissingTable(false);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      showMsg('error', err.message || 'Failed to fetch settings from Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (keysList: string[]) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = keysList.map((k) => ({
        key: k,
        value: (settings[k] || '').trim(),
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'key' });

      if (error) throw error;
      showMsg('success', 'Changes saved successfully to database!');
      fetchSettings();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading && !missingTable) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Instructor &amp; Stats Editor</h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage homepage metric counters and the "About the Instructor" section details dynamically.</p>
      </div>

      {missingTable && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Database Setup Required</h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            The <code>settings</code> table is missing from your Supabase database. Please copy the SQL below and execute it inside the <strong>SQL Editor</strong> on your Supabase dashboard to create the table.
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
          <button onClick={fetchSettings} className="px-4 py-2 bg-[#ff6b00] text-white rounded-lg text-xs font-bold hover:bg-[#e55a00] cursor-pointer transition-colors">
            Reload Settings Table
          </button>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="text-xs">{message.text}</span>
        </div>
      )}

      {/* METRICS PANEL */}
      <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Homepage Metric Stats</h3>
          <button
            type="button"
            disabled={isSaving || missingTable}
            onClick={() => handleSave(METRIC_KEYS.map(m => m.key))}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e55a00] disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Metrics
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRIC_KEYS.map((m) => (
            <div key={m.key} className="space-y-1">
              <label className="block text-[9px] text-gray-400 font-bold uppercase">{m.label}</label>
              <input
                type="text"
                value={settings[m.key] || ''}
                placeholder={m.placeholder}
                disabled={missingTable}
                onChange={(e) => setSettings((prev) => ({ ...prev, [m.key]: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] disabled:opacity-40"
              />
            </div>
          ))}
        </div>
      </div>

      {/* INSTRUCTOR BIO PANEL */}
      <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">About the Instructor Section</h3>
          <button
            type="button"
            disabled={isSaving || isUploading || missingTable}
            onClick={() => handleSave([...INSTRUCTOR_KEYS.map(k => k.key), 'instructor_image', 'instructor_bio_p1', 'instructor_bio_p2'])}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#e55a00] disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Instructor Info
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INSTRUCTOR_KEYS.map((item) => (
            <div key={item.key} className="space-y-1">
              <label className="block text-[9px] text-gray-400 font-bold uppercase">{item.label}</label>
              <input
                type="text"
                value={settings[item.key] || ''}
                placeholder={item.placeholder}
                disabled={missingTable}
                onChange={(e) => setSettings((prev) => ({ ...prev, [item.key]: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] disabled:opacity-40"
              />
            </div>
          ))}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Biography Paragraph 1</label>
            <textarea
              value={settings['instructor_bio_p1'] || ''}
              disabled={missingTable}
              rows={3}
              onChange={(e) => setSettings((prev) => ({ ...prev, instructor_bio_p1: e.target.value }))}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] resize-none disabled:opacity-40"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Biography Paragraph 2</label>
            <textarea
              value={settings['instructor_bio_p2'] || ''}
              disabled={missingTable}
              rows={3}
              onChange={(e) => setSettings((prev) => ({ ...prev, instructor_bio_p2: e.target.value }))}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00] resize-none disabled:opacity-40"
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Instructor Profile Image"
              value={settings['instructor_image'] || ''}
              onChange={(url) => setSettings((prev) => ({ ...prev, instructor_image: url }))}
              folder="instructor"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => showMsg('error', msg)}
              onSuccess={msg => showMsg('success', msg)}
              placeholder="https://... or upload from device"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
