'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, ArrowUpRight, CalendarDays, ClipboardList, FileText, Image, Mail, RefreshCw, Search, Users } from 'lucide-react';

interface OverviewRow {
  label: string;
  value: number | string;
  icon: typeof Users;
  accent: string;
}

interface Registration {
  id: number;
  name: string;
  email: string;
  program: string;
  status: string;
  created_at: string;
}

const COUNT_TABLES = [
  { table: 'contact_requests', label: 'Contact inquiries', icon: Mail, accent: 'text-sky-300' },
  { table: 'events', label: 'Upcoming events', icon: CalendarDays, accent: 'text-[#FC6129]' },
  { table: 'blogs', label: 'Blog posts', icon: FileText, accent: 'text-emerald-300' },
  { table: 'gallery', label: 'Gallery assets', icon: Image, accent: 'text-violet-300' },
] as const;

export default function DashboardOverview({ onNavigate = () => undefined }: { onNavigate?: (tab: string) => void }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadOverview() {
    setLoading(true);
    const nextCounts: Record<string, number> = {};
    await Promise.all(COUNT_TABLES.map(async ({ table }) => {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      nextCounts[table] = count || 0;
    }));
    const { count: memberCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    nextCounts.profiles = memberCount || 0;
    const { data } = await supabase.from('contact_requests').select('id,name,email,program,status,created_at').order('created_at', { ascending: false }).limit(8);
    setCounts(nextCounts);
    setRegistrations((data || []) as Registration[]);
    setLastUpdated(new Date());
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadOverview(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return registrations;
    return registrations.filter((item) => [item.name, item.email, item.program, item.status].join(' ').toLowerCase().includes(query));
  }, [registrations, search]);

  const overviewRows: OverviewRow[] = [
    { label: 'Total members', value: counts.profiles || 0, icon: Users, accent: 'text-[#FC6129]' },
    { label: 'Registrations', value: counts.contact_requests || 0, icon: ClipboardList, accent: 'text-amber-300' },
    ...COUNT_TABLES.slice(1).map(({ table, label, icon, accent }) => ({ label, value: counts[table] || 0, icon, accent })),
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FC6129]">Grow Fit control room</p><h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Good to see you.</h2><p className="mt-2 text-sm text-gray-400">A live pulse check on your fitness community and content.</p></div>
        <button onClick={loadOverview} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:border-[#FC6129]/50 hover:text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh data</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewRows.map(({ label, value, icon: Icon, accent }) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><div className="flex items-center justify-between"><Icon className={`h-5 w-5 ${accent}`} /><Activity className="h-4 w-4 text-gray-600" /></div><p className="mt-6 text-3xl font-black text-white">{loading ? '...' : value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p></div>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-black uppercase tracking-tight text-white">Recent registrations</h3><p className="mt-1 text-xs text-gray-500">New join requests across programs and activities.</p></div><label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search registrations" className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#FC6129] sm:w-64" /></label></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-500"><tr><th className="pb-3">Participant</th><th className="pb-3">Program</th><th className="pb-3">Status</th><th className="pb-3">Received</th></tr></thead><tbody className="divide-y divide-white/5">{filteredRegistrations.map((item) => <tr key={item.id}><td className="py-4"><p className="font-bold text-white">{item.name}</p><p className="text-xs text-gray-500">{item.email}</p></td><td className="py-4 text-gray-300">{item.program || 'General inquiry'}</td><td className="py-4"><span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">{item.status}</span></td><td className="py-4 text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td></tr>)}{!filteredRegistrations.length && <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-500">No registrations match this search.</td></tr>}</tbody></table></div></section>
        <section className="rounded-2xl border border-[#FC6129]/20 bg-[#FC6129]/[.06] p-5"><h3 className="font-black uppercase tracking-tight text-white">Quick actions</h3><div className="mt-5 space-y-3">{[['home', 'Update homepage'], ['events', 'Create event'], ['blog', 'Write blog post'], ['contact', 'Review inquiries']].map(([tab, label]) => <button key={tab} onClick={() => onNavigate(tab)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-left text-sm font-bold text-gray-200 transition hover:border-[#FC6129]/50 hover:text-white"><span>{label}</span><ArrowUpRight className="h-4 w-4 text-[#FC6129]" /></button>)}</div>{lastUpdated && <p className="mt-6 text-[10px] uppercase tracking-wider text-gray-500">Updated {lastUpdated.toLocaleTimeString()}</p>}</section>
      </div>
    </div>
  );
}
