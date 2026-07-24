"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2, Plus, Trash2, CheckCircle, AlertCircle, Pencil,
  EyeOff, Eye, X, Save, BookOpen
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category: string;
  status: 'active' | 'disabled';
  created_at?: string;
}

const CATEGORIES = ['Nutrition', 'Workout', 'Wellness', 'Lifestyle', 'Mindset', 'Training Tips', 'Motivation'];

const SAMPLE_POST = {
  title: '5 Rules of Active Hydration Every Athlete Must Know',
  excerpt: 'Most people drink water only when thirsty — but by then, you\'re already 2% dehydrated. Here\'s what elite athletes do differently.',
  content: `## Why Hydration Is Your Secret Performance Edge

Most athletes focus on training volume, nutrition timing, and sleep — and rightly so. But hydration is often the missing link between a good performance and a great one.

### Rule 1: Drink Before You're Thirsty
Thirst is a lagging indicator. By the time your brain signals thirst, you've already lost 1–2% of your body weight in water — enough to impair focus and reduce strength output by up to 10%.

**Action:** Start every workout pre-hydrated. Drink 500ml of water 30–60 minutes before training.

### Rule 2: Electrolytes Beat Plain Water During Intense Sessions
During heavy sweating, you lose sodium, potassium, and magnesium. Replacing lost fluids with plain water can dilute your electrolyte balance further, leading to cramping and fatigue.

**Action:** Add a pinch of Himalayan salt and a squeeze of lemon to your water bottle for workouts over 60 minutes.

### Rule 3: Track Your Sweat Rate
A simple way to measure hydration needs: weigh yourself before and after a workout. Every kilogram lost equals approximately 1 litre of fluid deficit.

### Rule 4: Colour Is Your Indicator
Pale yellow urine throughout the day = well hydrated. Dark amber = drink up now.

### Rule 5: Post-Workout Rehydration Is Not Optional
Your muscles need water to synthesise protein and clear metabolic waste. Aim to replace 150% of your fluid losses within 2 hours post-training.

---
*Train hard, hydrate smarter. Your performance depends on it.*`,
  category: 'Nutrition',
  cover_image: '',
};

export default function BlogEditor() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state (used for both add and edit)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Nutrition');

  useEffect(() => { fetchBlogs(); }, []);

  const showMsg = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('id', { ascending: false });
      if (error) throw error;
      setBlogs(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const resetForm = () => {
    setEditMode('add'); setEditId(null);
    setTitle(''); setExcerpt(''); setContent(''); setCoverImage(''); setCategory('Nutrition');
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      if (editMode === 'edit' && editId !== null) {
        const { error } = await supabase.from('blogs').update({
          title: title.trim(), slug, excerpt: excerpt.trim() || null,
          content: content.trim(), cover_image: coverImage || null, category,
        }).eq('id', editId);
        if (error) throw error;
        showMsg('success', 'Blog post updated!');
      } else {
        const { error } = await supabase.from('blogs').insert([{
          title: title.trim(), slug, excerpt: excerpt.trim() || null,
          content: content.trim(), cover_image: coverImage || null, category, status: 'active',
        }]);
        if (error) throw error;
        showMsg('success', 'Blog post published!');
      }
      resetForm();
      fetchBlogs();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to save.');
    } finally { setIsSaving(false); }
  };

  const handleSeedSample = async () => {
    if (!confirm('This will add a sample blog post to your blog. Continue?')) return;
    setIsSaving(true);
    try {
      const slug = SAMPLE_POST.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const { error } = await supabase.from('blogs').insert([{ ...SAMPLE_POST, slug, status: 'active' }]);
      if (error) throw error;
      showMsg('success', 'Sample blog post added!');
      fetchBlogs();
    } catch (err: any) {
      showMsg('error', err.message || 'Failed to add sample.');
    } finally { setIsSaving(false); }
  };

  const openEdit = (blog: BlogItem) => {
    setEditMode('edit'); setEditId(blog.id);
    setTitle(blog.title); setExcerpt(blog.excerpt || ''); setContent(blog.content);
    setCoverImage(blog.cover_image || ''); setCategory(blog.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      showMsg('success', 'Blog deleted.');
      fetchBlogs();
    } catch { showMsg('error', 'Failed to delete.'); }
  };

  const toggleStatus = async (blog: BlogItem) => {
    try {
      await supabase.from('blogs').update({ status: blog.status === 'active' ? 'disabled' : 'active' }).eq('id', blog.id);
      fetchBlogs();
    } catch { showMsg('error', 'Failed to update status.'); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#FC6129] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Blog Posts CMS</h2>
          <p className="text-xs text-gray-400 mt-0.5">Publish articles, nutrition guides, and lifestyle content.</p>
        </div>
        {blogs.length === 0 && (
          <button onClick={handleSeedSample} disabled={isSaving}
            className="px-3 py-1.5 text-[10px] font-bold text-[#FC6129] border border-[#FC6129]/30 rounded-lg hover:bg-[#FC6129]/10 transition-colors cursor-pointer">
            + Add Sample Post
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="text-xs">{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handlePublish} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {editMode === 'edit' ? '✏️ Editing Post' : 'Publish New Blog Post'}
          </h3>
          {editMode === 'edit' && (
            <button type="button" onClick={resetForm} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Article Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129]"
              placeholder="e.g. 5 Rules of Active Hydration" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129] cursor-pointer">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Excerpt / Summary</label>
            <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129]"
              placeholder="Short one-liner summary..." />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">
              Full Content * <span className="text-gray-600 ml-1">({content.length} chars)</span>
            </label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={10} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#FC6129] font-mono resize-y"
              placeholder="Write the full article content here. Markdown is supported." />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Cover Image"
              value={coverImage}
              onChange={setCoverImage}
              folder="blogs"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => showMsg('error', msg)}
              onSuccess={msg => showMsg('success', msg)}
            />
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#FC6129] hover:bg-[#d94d1e] rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editMode === 'edit' ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isSaving ? 'Saving...' : editMode === 'edit' ? 'Update Post' : 'Publish Post'}
        </button>
      </form>

      {/* Posts List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Published Posts ({blogs.length})</h3>
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl text-gray-500 space-y-2">
            <BookOpen className="w-10 h-10" />
            <p className="text-xs">No blog posts yet. Use the form above or add a sample post.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {blogs.map(blog => (
              <div key={blog.id} className={`flex bg-white/5 border rounded-xl overflow-hidden transition-colors ${editId === blog.id ? 'border-[#FC6129]/40 bg-[#FC6129]/5' : 'border-white/5 hover:border-white/10'}`}>
                {blog.cover_image && (
                  <div className="w-24 shrink-0">
                    <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover"
                      onError={e => { (e.target as any).style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex-1 p-3 space-y-1.5 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-white text-xs leading-tight truncate">{blog.title}</p>
                    <span className={`shrink-0 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${blog.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700/50 text-gray-400'}`}>
                      {blog.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#FC6129]">/{blog.slug} · {blog.category}</p>
                  {blog.excerpt && <p className="text-[10px] text-gray-500 line-clamp-1">{blog.excerpt}</p>}
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => openEdit(blog)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-[#FC6129]/20 text-gray-300 hover:text-white rounded-lg border border-white/5 cursor-pointer text-[10px] transition-colors">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => toggleStatus(blog)}
                      className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-gray-300 hover:text-blue-300 rounded-lg border border-white/5 cursor-pointer transition-colors">
                      {blog.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDeleteBlog(blog.id)}
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
    </div>
  );
}
