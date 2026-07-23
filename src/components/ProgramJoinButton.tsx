'use client';

import { ArrowUpRight } from 'lucide-react';
import { useJoinModal } from '@/context/JoinModalContext';

export default function ProgramJoinButton({ program, label = 'Join now' }: { program: string; label?: string }) {
  const { openModal } = useJoinModal();

  return (
    <button onClick={() => openModal(program)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FC6129] px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:-translate-y-1 hover:bg-white hover:text-black">
      {label}
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}
