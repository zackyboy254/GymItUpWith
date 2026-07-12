"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
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
}

export default function BlogEditor() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Nutrition');

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('id', { ascending: false });
      if (error) throw error;
      setBlogs(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      const { error } = await supabase.from('blogs').insert([{
        title, slug, excerpt: excerpt || null, content,
        cover_image: coverImage || null, category, status: 'active',
      }]);
      if (error) throw error;
      setTitle(''); setExcerpt(''); setContent(''); setCoverImage('');
      setMessage({ type: 'success', text: 'Blog post published!' });
      fetchBlogs();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to publish.' });
    } finally { setIsSaving(false); }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Blog deleted.' });
      fetchBlogs();
    } catch { setMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  const toggleStatus = async (id: number, status: string) => {
    try { await supabase.from('blogs').update({ status: status === 'active' ? 'disabled' : 'active' }).eq('id', id); fetchBlogs(); }
    catch (err) { console.error(err); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Blog Posts CMS</h2>
        <p className="text-xs text-gray-400">Publish training articles, nutrition guides, and lifestyle content.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handlePublish} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Publish New Blog Post</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Article Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. 5 Rules of Active Hydration" />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Category</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
              placeholder="e.g. Nutrition, Cardio, Strength" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Excerpt / Summary</label>
            <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white"
              placeholder="Short description summarizing the article." />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] text-gray-400 font-bold uppercase">Full Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
              placeholder="Write the full article content here..." />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Cover Image"
              value={coverImage}
              onChange={setCoverImage}
              folder="blogs"
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onError={msg => setMessage({ type: 'error', text: msg })}
              onSuccess={msg => setMessage({ type: 'success', text: msg })}
            />
          </div>
        </div>
        <button type="submit" disabled={isSaving || isUploading} className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff6b00] hover:bg-[#ff2a2a] rounded-lg transition-colors cursor-pointer disabled:opacity-50">
          <Plus className="w-4 h-4" />
          <span>{isSaving ? 'Publishing...' : 'Publish Post'}</span>
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Published Posts ({blogs.length})</h3>
        {blogs.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No blog posts found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {blogs.map(blog => (
              <div key={blog.id} className="flex bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                {blog.cover_image && (
                  <div className="w-24 shrink-0">
                    <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover"
                      onError={e => { (e.target as any).style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex-1 p-3 space-y-1.5">
                  <p className="font-bold text-white text-xs leading-tight">{blog.title}</p>
                  <p className="text-[10px] text-gray-400">/{blog.slug} · {blog.category}</p>
                  {blog.excerpt && <p className="text-[10px] text-gray-500 line-clamp-1">{blog.excerpt}</p>}
                  <div className="flex items-center space-x-2 pt-1">
                    <span className={`text-[9px] font-bold ${blog.status === 'active' ? 'text-emerald-400' : 'text-gray-400'}`}>{blog.status}</span>
                    <button onClick={() => toggleStatus(blog.id, blog.status)} className="px-2 py-0.5 bg-black/40 text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer text-[10px]">Toggle</button>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="p-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded cursor-pointer">
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
