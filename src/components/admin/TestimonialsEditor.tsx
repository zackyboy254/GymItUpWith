"use client";

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface TestimonialRecord {
  id: number;
  name: string;
  role: string | null;
  quote: string;
  achievement: string | null;
  rating: number;
  image_url: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  featured: boolean;
  status: 'active' | 'disabled';
  display_order: number;
  created_at?: string;
}

interface TestimonialForm {
  name: string;
  role: string;
  quote: string;
  achievement: string;
  rating: string;
  image_url: string;
  before_image_url: string;
  after_image_url: string;
  featured: boolean;
  status: TestimonialRecord['status'];
  display_order: string;
}

const emptyForm: TestimonialForm = {
  name: '',
  role: '',
  quote: '',
  achievement: '',
  rating: '5',
  image_url: '',
  before_image_url: '',
  after_image_url: '',
  featured: false,
  status: 'active',
  display_order: '0',
};

export default function TestimonialsEditor() {
  const [items, setItems] = useState<TestimonialRecord[]>([]);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  async function loadTestimonials() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false });
      if (error) {
        setMessage(error.message);
        return;
      }
      setItems((data || []) as TestimonialRecord[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTestimonials();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(item: TestimonialRecord) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role || '',
      quote: item.quote,
      achievement: item.achievement || '',
      rating: String(item.rating || 5),
      image_url: item.image_url || '',
      before_image_url: item.before_image_url || '',
      after_image_url: item.after_image_url || '',
      featured: item.featured,
      status: item.status,
      display_order: String(item.display_order || 0),
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || null,
      quote: form.quote.trim(),
      achievement: form.achievement.trim() || null,
      rating: Number(form.rating) || 5,
      image_url: form.image_url.trim() || null,
      before_image_url: form.before_image_url.trim() || null,
      after_image_url: form.after_image_url.trim() || null,
      featured: form.featured,
      status: form.status,
      display_order: Number(form.display_order) || 0,
    };

    const result = editingId
      ? await supabase.from('testimonials').update(payload).eq('id', editingId)
      : await supabase.from('testimonials').insert(payload);

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(editingId ? 'Testimonial updated.' : 'Testimonial created.');
      resetForm();
      await loadTestimonials();
    }
    setSaving(false);
  }

  async function toggleStatus(item: TestimonialRecord) {
    const nextStatus = item.status === 'active' ? 'disabled' : 'active';
    const { error } = await supabase.from('testimonials').update({ status: nextStatus }).eq('id', item.id);
    if (error) {
      setMessage(error.message);
    } else {
      await loadTestimonials();
    }
  }

  async function remove(item: TestimonialRecord) {
    if (!confirm(`Delete ${item.name}?`)) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', item.id);
    if (error) {
      setMessage(error.message);
    } else {
      await loadTestimonials();
    }
  }

  const featuredCount = useMemo(() => items.filter((item) => item.featured).length, [items]);
  const inputClass = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#FC6129]';

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#FC6129]">Community proof</p>
          <h2 className="mt-1 text-xl font-black uppercase text-white">Testimonials</h2>
          <p className="mt-1 text-xs text-gray-400">Coordinate member stories, feature highlights, and ratings from a single place.</p>
        </div>
        <div className="text-sm text-gray-400">{featuredCount} featured · {items.length} total</div>
      </div>

      {message ? <p className="rounded-xl border border-[#FC6129]/20 bg-[#FC6129]/10 p-3 text-xs text-[#ff9c7c]">{message}</p> : null}

      <form onSubmit={save} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="admin-label">Member name</label>
          <input className={inputClass} value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required />
        </div>
        <div>
          <label className="admin-label">Role / title</label>
          <input className={inputClass} value={form.role} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))} placeholder="Member / Coach / Client" />
        </div>
        <div>
          <label className="admin-label">Rating</label>
          <select className={inputClass} value={form.rating} onChange={(e) => setForm((current) => ({ ...current, rating: e.target.value }))}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
          </select>
        </div>
        <div>
          <label className="admin-label">Transformation summary</label>
          <input className={inputClass} value={form.achievement} onChange={(e) => setForm((current) => ({ ...current, achievement: e.target.value }))} placeholder="Lost 14 kg in 90 days" />
        </div>
        <div>
          <label className="admin-label">Display order</label>
          <input className={inputClass} type="number" value={form.display_order} onChange={(e) => setForm((current) => ({ ...current, display_order: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Quote</label>
          <textarea className={`${inputClass} min-h-28`} value={form.quote} onChange={(e) => setForm((current) => ({ ...current, quote: e.target.value }))} required />
        </div>
        <div className="md:col-span-2">
          <ImageUploadField label="Member photo" value={form.image_url} onChange={(url) => setForm((current) => ({ ...current, image_url: url }))} folder="testimonials" bucket="gym-images" isUploading={isUploading} setIsUploading={setIsUploading} />
        </div>
        <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
          <ImageUploadField label="Before image (optional)" value={form.before_image_url} onChange={(url) => setForm((current) => ({ ...current, before_image_url: url }))} folder="testimonials/before" bucket="gym-images" isUploading={isUploading} setIsUploading={setIsUploading} />
          <ImageUploadField label="After image (optional)" value={form.after_image_url} onChange={(url) => setForm((current) => ({ ...current, after_image_url: url }))} folder="testimonials/after" bucket="gym-images" isUploading={isUploading} setIsUploading={setIsUploading} />
        </div>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-300">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((current) => ({ ...current, featured: e.target.checked }))} className="accent-[#FC6129]" />
            Feature on homepage
          </label>
          <select className={`${inputClass} max-w-40`} value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as TestimonialRecord['status'] }))}>
            <option value="active">Published</option>
            <option value="disabled">Draft</option>
          </select>
          <button type="submit" disabled={saving} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase text-black disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {editingId ? 'Save testimonial' : 'Create testimonial'}
          </button>
          {editingId ? <button type="button" onClick={resetForm} className="rounded-xl border border-white/10 p-2.5 text-gray-400 hover:text-white"><X className="h-4 w-4" /></button> : null}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#FC6129]" /></div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                {item.image_url ? <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-xl object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FC6129]/10 text-sm font-black text-[#FC6129]">{item.name.slice(0, 1).toUpperCase()}</div>}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    {item.featured ? <span className="rounded-full bg-[#FC6129]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#FC6129]">Featured</span> : null}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.status === 'active' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-gray-400'}`}>{item.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{item.role || 'Member'} · {item.achievement || 'Transformation story'} · {item.rating}★</p>
                  <p className="mt-2 text-sm text-gray-300 line-clamp-2">{item.quote}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(item)} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white" aria-label={`Edit ${item.name}`}><Pencil className="h-4 w-4" /></button>
                <button onClick={() => toggleStatus(item)} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white" aria-label={`Toggle ${item.name}`}>{item.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={() => remove(item)} className="rounded-lg border border-rose-400/20 p-2 text-rose-300 hover:bg-rose-400/10" aria-label={`Delete ${item.name}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
