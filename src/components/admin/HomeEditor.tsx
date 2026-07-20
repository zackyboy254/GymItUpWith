"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface HomeContent {
  id?: number;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  hero_image_url?: string;
  status?: 'active' | 'disabled';
}

export default function HomeEditor() {
  const [content, setContent] = useState<HomeContent>({
    title: 'Push Your Limits Shape Your Destiny',
    subtitle: 'Welcome to GymItUpWith Billy. Custom-tailored workouts, results-oriented training plans, and a community dedicated to excellence.',
    cta_text: 'Join Program',
    cta_url: '#join',
    status: 'active',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [missingTable, setMissingTable] = useState(false);

  useEffect(() => {
    async function fetchHomeContent() {
      try {
        const { data, error } = await supabase
          .from('home_content')
          .select('*')
          .eq('status', 'active')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          const message = (error.message || '').toLowerCase();
          if (message.includes('column') && message.includes('status') && message.includes('does not exist')) {
            const fallback = await supabase
              .from('home_content')
              .select('*')
              .order('id', { ascending: true })
              .limit(1)
              .maybeSingle();

            if (fallback.error) {
              if (fallback.error.code === 'PGRST205') {
                setMissingTable(true);
                return;
              }
              throw fallback.error;
            }

            if (fallback.data) {
              setContent({
                ...fallback.data,
                status: fallback.data.status ?? 'active',
                hero_image_url: fallback.data.hero_image_url || fallback.data.bg_image_id || undefined,
              });
            }
            return;
          }

          if (error.code === 'PGRST205') {
            setMissingTable(true);
            return;
          }
          throw error;
        }
        if (data) {
          setContent({
            ...data,
            status: data.status ?? 'active',
            hero_image_url: data.hero_image_url || data.bg_image_id || undefined,
          });
        }
      } catch (err: any) {
        console.warn('Error fetching home content:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHomeContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        title: content.title,
        subtitle: content.subtitle,
        cta_text: content.cta_text,
        cta_url: content.cta_url,
        hero_image_url: content.hero_image_url || null,
        status: content.status ?? 'active',
      };
      let error;
      if (content.id) {
        const { error: err } = await supabase.from('home_content').update(payload).eq('id', content.id);
        error = err;
      } else {
        const { data, error: err } = await supabase.from('home_content').insert([payload]).select().single();
        if (data) setContent(data);
        error = err;
      }
      if (error) throw error;
      setMessage({ type: 'success', text: 'Home page content updated successfully!' });
    } catch (err: any) {
      console.error('Error saving home content:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save home content.' });
    } finally {
      setIsSaving(false);
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
          The table <code>home_content</code> does not exist in your Supabase database. Please copy the contents of the database schema file and execute it in your Supabase SQL Editor.
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Main Hero Content</h2>
        <p className="text-xs text-gray-400">Configure the central heading, copy, and action buttons on your main landing page.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Hero Headline (supports &lt;span&gt; highlight tags if desired)
          </label>
          <input
            type="text"
            value={content.title}
            onChange={e => setContent(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
            required
            placeholder="Push Your Limits Shape Your Destiny"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Hero Subheadline
          </label>
          <textarea
            value={content.subtitle}
            onChange={e => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
            required
            placeholder="Welcome to GymItUpWith Billy..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Primary CTA Button Label
            </label>
            <input
              type="text"
              value={content.cta_text}
              onChange={e => setContent(prev => ({ ...prev, cta_text: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
              required
              placeholder="Join Program"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Primary CTA Button URL/Target
            </label>
            <input
              type="text"
              value={content.cta_url}
              onChange={e => setContent(prev => ({ ...prev, cta_url: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
              required
              placeholder="/contact"
            />
          </div>
        </div>

        <div className="space-y-2">
          <ImageUploadField
            label="Hero Side Image (replaces the right-side gym photo)"
            value={content.hero_image_url || ''}
            onChange={url => setContent(prev => ({ ...prev, hero_image_url: url }))}
            folder="hero"
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            onError={msg => setMessage({ type: 'error', text: msg })}
            onSuccess={msg => setMessage({ type: 'success', text: msg })}
            placeholder="https://... or upload from device"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Visibility Status
          </label>
          <select
            value={content.status}
            onChange={e => setContent(prev => ({ ...prev, status: e.target.value as 'active' | 'disabled' }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
          >
            <option value="active">Visible on homepage</option>
            <option value="disabled">Hidden from homepage</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="inline-flex items-center space-x-2 px-6 py-3 font-bold text-white bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] hover:from-[#ff2a2a] hover:to-[#ff6b00] rounded-xl shadow-lg shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving updates...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
