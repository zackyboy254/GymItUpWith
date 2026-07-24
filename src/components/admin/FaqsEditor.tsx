"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

interface FaqRecord {
  id: number;
  question: string;
  answer: string;
  display_order: number;
  status: 'active' | 'disabled';
  created_at?: string;
}

interface FaqForm {
  question: string;
  answer: string;
  display_order: string;
  status: FaqRecord['status'];
}

const emptyForm: FaqForm = {
  question: '',
  answer: '',
  display_order: '0',
  status: 'active',
};

export default function FaqsEditor() {
  const [items, setItems] = useState<FaqRecord[]>([]);
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadFaqs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        setMessage(error.message);
        setItems([]);
        return;
      }

      setItems((data || []) as FaqRecord[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFaqs();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(item: FaqRecord) {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      display_order: String(item.display_order || 0),
      status: item.status,
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      display_order: Number(form.display_order) || 0,
      status: form.status,
    };

    const result = editingId
      ? await supabase.from('faqs').update(payload).eq('id', editingId)
      : await supabase.from('faqs').insert(payload);

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(editingId ? 'FAQ updated.' : 'FAQ created.');
      resetForm();
      await loadFaqs();
    }

    setSaving(false);
  }

  async function toggleStatus(item: FaqRecord) {
    const nextStatus = item.status === 'active' ? 'disabled' : 'active';
    const { error } = await supabase.from('faqs').update({ status: nextStatus }).eq('id', item.id);

    if (error) {
      setMessage(error.message);
    } else {
      await loadFaqs();
    }
  }

  async function remove(item: FaqRecord) {
    if (!confirm(`Delete “${item.question}”?`)) return;

    const { error } = await supabase.from('faqs').delete().eq('id', item.id);
    if (error) {
      setMessage(error.message);
    } else {
      await loadFaqs();
    }
  }

  const inputClass = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#FC6129]';

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#FC6129]">Community answers</p>
          <h2 className="mt-1 text-xl font-black uppercase text-white">FAQs</h2>
          <p className="mt-1 text-xs text-gray-400">Update the frequently asked questions shown on the public homepage.</p>
        </div>
        <div className="text-sm text-gray-400">{items.length} total</div>
      </div>

      {message ? <p className="rounded-xl border border-[#FC6129]/20 bg-[#FC6129]/10 p-3 text-xs text-[#ff9c7c]">{message}</p> : null}

      <form onSubmit={save} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <div>
          <label className="admin-label">Question</label>
          <input
            className={inputClass}
            value={form.question}
            onChange={(e) => setForm((current) => ({ ...current, question: e.target.value }))}
            required
            placeholder="Is this suitable for beginners?"
          />
        </div>

        <div>
          <label className="admin-label">Answer</label>
          <textarea
            className={`${inputClass} min-h-28`}
            value={form.answer}
            onChange={(e) => setForm((current) => ({ ...current, answer: e.target.value }))}
            required
            placeholder="Share the helpful answer visitors should see."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <label className="admin-label">Display order</label>
            <input
              className={inputClass}
              type="number"
              value={form.display_order}
              onChange={(e) => setForm((current) => ({ ...current, display_order: e.target.value }))}
            />
          </div>
          <div>
            <label className="admin-label">Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as FaqRecord['status'] }))}
            >
              <option value="active">Published</option>
              <option value="disabled">Draft</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase text-black disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {editingId ? 'Save FAQ' : 'Create FAQ'}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-xl border border-white/10 p-2.5 text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#FC6129]" />
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{item.question}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.status === 'active' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-gray-400'}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{item.answer}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(item)} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white" aria-label={`Edit ${item.question}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => toggleStatus(item)} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white" aria-label={`Toggle ${item.question}`}>
                  {item.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => remove(item)} className="rounded-lg border border-rose-400/20 p-2 text-rose-300 hover:bg-rose-400/10" aria-label={`Delete ${item.question}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
