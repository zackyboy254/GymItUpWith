import { notFound } from 'next/navigation';
import ScrollReveal from '@/components/ScrollReveal';
import PageBackground from '@/components/PageBackground';
import ProgramJoinButton from '@/components/ProgramJoinButton';
import { PROGRAM_DETAILS, PROGRAM_SLUGS } from '@/lib/programs';
import { Check, ChevronRight, HelpCircle } from 'lucide-react';

export function generateStaticParams() {
  return Object.keys(PROGRAM_SLUGS).filter((slug) => slug.includes('challenge') || ['weight-loss', 'core-abs-challenge', 'squat-challenge'].includes(slug)).map((slug) => ({ slug }));
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = PROGRAM_SLUGS[slug];
  if (!program) notFound();
  const detail = PROGRAM_DETAILS[program];
  return <ActivityDetail detail={detail} program={program} related="activities" />;
}

export function ActivityDetail({ detail, program, related }: { detail: (typeof PROGRAM_DETAILS)[keyof typeof PROGRAM_DETAILS]; program: string; related: string }) {
  return <>
    <PageBackground variant="home" />
    <main className="overflow-hidden bg-[#08100f] text-white">
      <section className="relative min-h-[70vh] overflow-hidden"><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${detail.image}')` }} /><div className="absolute inset-0 bg-gradient-to-r from-[#08100f]/95 via-[#08100f]/75 to-[#08100f]/25" /><div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-end px-5 pb-20 pt-36 sm:px-8 lg:px-12"><div className="max-w-3xl"><p className="eyebrow">{detail.eyebrow}</p><h1 className="mt-5 text-6xl font-black uppercase leading-[.9] tracking-[-.05em] sm:text-8xl">{detail.title}</h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/75">{detail.description}</p><div className="mt-8"><ProgramJoinButton program={program} label="Join now" /></div></div></div></section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-12"><ScrollReveal><p className="eyebrow">What you get</p><h2 className="section-title">Built for <span>real life.</span></h2><div className="mt-10 grid gap-4 sm:grid-cols-2">{detail.benefits.map((benefit) => <div key={benefit} className="rounded-2xl border border-white/10 bg-white/[.05] p-5"><Check className="h-5 w-5 text-[#FC6129]" /><p className="mt-5 font-bold">{benefit}</p></div>)}</div></ScrollReveal><ScrollReveal className="rounded-3xl border border-white/10 bg-[#101b18] p-8 sm:p-10"><p className="eyebrow">Details</p><div className="mt-8 space-y-7"><Info label="Eligibility" value={detail.eligibility} /><Info label="Schedule" value={detail.schedule} /><div><p className="text-xs font-bold uppercase tracking-wider text-[#FC6129]">What to bring</p><ul className="mt-3 space-y-2 text-sm text-white/65">{detail.bring.map((item) => <li key={item} className="flex gap-2"><ChevronRight className="h-4 w-4 shrink-0 text-[#FC6129]" />{item}</li>)}</ul></div></div></ScrollReveal></section>
      <section className="border-y border-white/10 bg-[#101b18] px-5 py-24 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><p className="eyebrow">Frequently asked</p><h2 className="section-title">Good questions <span>welcome.</span></h2><div className="mt-10 grid gap-4 md:grid-cols-3"><Faq question="Is this suitable for beginners?" answer="Yes. Coaches offer progressions and alternatives so you can begin at the right level." /><Faq question="How do I get started?" answer="Use the Join Now button and tell us your goals. We will confirm the next available date." /><Faq question="What happens after I register?" answer="A member of the Grow Fit team will contact you with schedule and preparation details." /></div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 lg:px-12"><p className="eyebrow">Your next step</p><h2 className="section-title">Start with <span>one decision.</span></h2><p className="mx-auto mt-5 max-w-xl text-white/55">You do not need to have it all figured out. You just need a place to begin.</p><div className="mt-8"><ProgramJoinButton program={program} label="Join this program" /></div><p className="mt-7 text-sm text-white/40">Explore more {related} in the Grow Fit community.</p></section>
    </main>
  </>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-bold uppercase tracking-wider text-[#FC6129]">{label}</p><p className="mt-2 text-sm leading-relaxed text-white/65">{value}</p></div>; }
function Faq({ question, answer }: { question: string; answer: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.04] p-6"><HelpCircle className="h-5 w-5 text-[#FC6129]" /><h3 className="mt-5 font-bold">{question}</h3><p className="mt-3 text-sm leading-relaxed text-white/55">{answer}</p></div>; }
