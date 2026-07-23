'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

interface Program { id: number; title: string; slug: string; description: string; cover_image: string | null; duration: string | null; difficulty: string | null; price: number | null; display_order: number; featured: boolean; status: 'active' | 'draft' | 'archived'; }
type ProgramForm = { title: string; slug: string; description: string; cover_image: string; duration: string; difficulty: string; price: string; display_order: string; featured: boolean; status: Program['status'] };
const emptyProgram: ProgramForm = { title: '', slug: '', description: '', cover_image: '', duration: '', difficulty: 'All levels', price: '', display_order: '0', featured: false, status: 'draft' };

export default function ProgramsEditor() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [form, setForm] = useState(emptyProgram);
  const [editing, setEditing] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadPrograms() {
    setLoading(true);
    const { data, error } = await supabase.from('programs').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) setMessage(`Programs table unavailable: ${error.message}`); else setPrograms((data || []) as Program[]);
    setLoading(false);
  }
  useEffect(() => { const timer = window.setTimeout(() => { void loadPrograms(); }, 0); return () => window.clearTimeout(timer); }, []);

  function edit(program: Program) { setEditing(program); setForm({ title: program.title, slug: program.slug, description: program.description, cover_image: program.cover_image || '', duration: program.duration || '', difficulty: program.difficulty || 'All levels', price: program.price?.toString() || '', display_order: program.display_order.toString(), featured: program.featured, status: program.status }); }
  function reset() { setEditing(null); setForm(emptyProgram); }
  function update(key: keyof typeof emptyProgram, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('');
    const payload = { ...form, price: form.price ? Number(form.price) : null, display_order: Number(form.display_order) || 0, cover_image: form.cover_image || null };
    const result = editing ? await supabase.from('programs').update(payload).eq('id', editing.id) : await supabase.from('programs').insert(payload);
    if (result.error) setMessage(result.error.message); else { setMessage(editing ? 'Program updated.' : 'Program created.'); reset(); await loadPrograms(); }
    setSaving(false);
  }
  async function remove(id: number) { if (!confirm('Archive this program?')) return; const { error } = await supabase.from('programs').update({ status: 'archived' }).eq('id', id); if (error) setMessage(error.message); else await loadPrograms(); }
  async function toggle(program: Program) { const { error } = await supabase.from('programs').update({ status: program.status === 'active' ? 'draft' : 'active' }).eq('id', program.id); if (error) setMessage(error.message); else await loadPrograms(); }

  const inputClass = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#FC6129]';
  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#FC6129]">Content library</p><h2 className="mt-1 text-xl font-black uppercase text-white">Programs & challenges</h2><p className="mt-1 text-xs text-gray-400">Create once, publish everywhere, and keep the community offer current.</p></div><button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FC6129] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white"><Plus className="h-4 w-4" /> New program</button></div>
    {message && <p className="rounded-xl border border-[#FC6129]/20 bg-[#FC6129]/10 p-3 text-xs text-[#ff9c7c]">{message}</p>}
    <form onSubmit={save} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-5 md:grid-cols-2">
      <div className="md:col-span-2"><label className="admin-label">Title</label><input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} required /></div>
      <div><label className="admin-label">Slug</label><input className={inputClass} value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="weight-loss" required /></div>
      <div><label className="admin-label">Duration</label><input className={inputClass} value={form.duration} onChange={(e) => update('duration', e.target.value)} placeholder="12 weeks" /></div>
      <div><label className="admin-label">Difficulty</label><select className={inputClass} value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
      <div><label className="admin-label">Price (optional)</label><input className={inputClass} type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} /></div>
      <div><label className="admin-label">Display order</label><input className={inputClass} type="number" value={form.display_order} onChange={(e) => update('display_order', e.target.value)} /></div>
      <div><label className="admin-label">Cover image URL</label><input className={inputClass} type="url" value={form.cover_image} onChange={(e) => update('cover_image', e.target.value)} /></div>
      <div className="md:col-span-2"><label className="admin-label">Description</label><textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(e) => update('description', e.target.value)} required /></div>
      <div className="flex items-center gap-5 md:col-span-2"><label className="flex items-center gap-2 text-xs font-bold text-gray-300"><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="accent-[#FC6129]" /> Featured on homepage</label><select className={`${inputClass} max-w-40`} value={form.status} onChange={(e) => update('status', e.target.value)}><option value="draft">Draft</option><option value="active">Published</option><option value="archived">Archived</option></select><button type="submit" disabled={saving} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase text-black disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editing ? 'Save changes' : 'Create program'}</button>{editing && <button type="button" onClick={reset} className="rounded-xl border border-white/10 p-2.5 text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>}</div>
    </form>
    {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#FC6129]" /></div> : <div className="grid gap-3">{programs.map((program) => <div key={program.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><h3 className="font-bold text-white">{program.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${program.status === 'active' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-gray-400'}`}>{program.status}</span></div><p className="mt-1 text-xs text-gray-500">/{program.slug} · {program.difficulty || 'All levels'} · {program.duration || 'No duration'}</p></div><div className="flex items-center gap-2"><button onClick={() => edit(program)} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white" aria-label={`Edit ${program.title}`}><Pencil className="h-4 w-4" /></button><button onClick={() => toggle(program)} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white" aria-label={`Toggle ${program.title}`}>{program.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button onClick={() => remove(program.id)} className="rounded-lg border border-rose-400/20 p-2 text-rose-300 hover:bg-rose-400/10" aria-label={`Archive ${program.title}`}><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}
  </div>;
}
