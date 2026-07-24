'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useJoinModal } from '@/context/JoinModalContext';
import ScrollReveal from '@/components/ScrollReveal';
import PageBackground from '@/components/PageBackground';
import { ArrowUpRight, Award, Bike, Brain, Check, ChevronLeft, ChevronRight, Dumbbell, Flame, HeartPulse, HelpCircle, Mountain, Network, PersonStanding, Sparkles, Star, Target, Trophy, Users, Waves } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1920&q=80',
];
const FALLBACK_QUOTE = { text: 'Consistency beats intensity. Show up for yourself daily.', author: 'Coach Billy' };
const DEFAULT_PROGRAMS = [
  { title: 'Weight Loss Program', description: 'A practical, coach-led plan for sustainable fat loss, better energy, and confidence that lasts.', level: 'All levels', duration: '12 weeks', icon: Flame, featured: true },
  { title: '90-Day Transformation', description: 'A focused reset with training, nutrition, check-ins, and a community that keeps you moving.', level: 'Intermediate', duration: '90 days', icon: Trophy },
  { title: 'Push-Up Challenge', description: 'Build pressing strength and a habit of showing up with a progressive daily target.', level: 'Beginner', duration: '30 days', icon: Dumbbell },
  { title: 'Pull-Up Challenge', description: 'Develop your back and grip with accessible progressions from first rep to clean sets.', level: 'Intermediate', duration: '6 weeks', icon: Target },
  { title: 'Core & Abs Challenge', description: 'Train a strong, stable center with short sessions designed to fit real life.', level: 'All levels', duration: '21 days', icon: PersonStanding },
  { title: 'Squat Challenge', description: 'Move better, build lower-body strength, and make consistency your superpower.', level: 'Beginner', duration: '30 days', icon: Brain },
];
const DEFAULT_ACTIVITIES = [
  ['Community Runs', 'Easy-paced miles, good conversation, and a stronger finish.', 'Saturdays · 7:00 AM', Bike, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80'],
  ['Fitness Walks', 'Low-impact movement for every pace and every starting point.', 'Sundays · 8:00 AM', PersonStanding, 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=80'],
  ['Hiking Adventures', 'Trade the treadmill for fresh air, new trails, and shared milestones.', 'Monthly · See calendar', Mountain, 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80'],
  ['Outdoor Workouts', 'Sunrise circuits that make training feel like the best part of your day.', 'Saturdays · 9:00 AM', Waves, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80'],
  ['Community Meetups', 'A relaxed table for introductions, wins, ideas, and accountability.', 'First Friday · 6:30 PM', Users, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80'],
];
const DEFAULT_TESTIMONIALS = [
  { name: 'Maya K.', achievement: 'Lost 14 kg in 90 days', quote: 'I came for the plan and stayed for the people. The accountability changed everything.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80' },
  { name: 'David O.', achievement: 'Built strength and confidence', quote: 'Every session meets you where you are, then gives you a clear next step.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80' },
  { name: 'Nadia W.', achievement: 'Found her fitness community', quote: 'Grow Fit is the first place where my professional and personal worlds feel connected.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80' },
];
const DEFAULT_FAQS = [
  { question: 'Is this suitable for beginners?', answer: 'Absolutely. We meet members at their current level and offer options that make progress feel accessible from day one.' },
  { question: 'How quickly can I get started?', answer: 'Most new members can join within a few days. We will guide you through the first steps and help you choose the right challenge.' },
  { question: 'What happens after I register?', answer: 'You will receive next-step guidance, community access, and the support needed to settle into your new routine with confidence.' },
  { question: 'Do I need a gym background?', answer: 'No. The community is built for people who want structure, support, and a fresh start without feeling intimidated.' },
  { question: 'Can I join if I have a busy schedule?', answer: 'Yes. Our sessions and programs are designed to fit real-life routines, from flexible weekly plans to focused challenge blocks.' },
  { question: 'Is this more than a workout plan?', answer: 'Yes. You are joining a broader fitness community with accountability, events, coaching, and meaningful connection.' },
];
const networkRoles = ['Software Engineers', 'Doctors', 'Entrepreneurs', 'Lawyers', 'Accountants', 'Designers', 'Students', 'Creatives'];
const communityPillars = ['Weekly Meetups', 'Accountability Groups', 'Transformation Challenges', 'Fitness Events', 'Networking Sessions', 'Outdoor Adventures', 'Achievement Celebrations'];

export default function HomePage() {
  const { openModal } = useJoinModal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quote, setQuote] = useState(FALLBACK_QUOTE);
  const [heroTitle, setHeroTitle] = useState('Grow strong. Live better.');
  const [heroSubtitle, setHeroSubtitle] = useState('A premium fitness community for body transformation, accountability, and a life that feels fully switched on.');
  const [heroCtaText, setHeroCtaText] = useState('Join the Community');
  const [carouselImages, setCarouselImages] = useState(FALLBACK_IMAGES);
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((slide) => (slide + 1) % carouselImages.length), 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  useEffect(() => {
    async function loadContent() {
      try {
        const response = await fetch('/api/content/home');
        const payload = await response.json();

        if (payload?.hero) {
          setHeroTitle(payload.hero.title || 'Grow strong. Live better.');
          setHeroSubtitle(payload.hero.subtitle || 'A premium fitness community for body transformation, accountability, and a life that feels fully switched on.');
          setHeroCtaText(payload.hero.ctaText || 'Join the Community');
        }

        if (Array.isArray(payload?.carousel) && payload.carousel.length) {
          setCarouselImages(payload.carousel);
        }

        if (payload?.quote) {
          setQuote(payload.quote);
        }

        if (Array.isArray(payload?.programs) && payload.programs.length) {
          const iconFor = (title: string) => title.toLowerCase().includes('weight') ? Flame : title.toLowerCase().includes('pull') ? Target : title.toLowerCase().includes('push') ? Dumbbell : title.toLowerCase().includes('squat') ? Brain : title.toLowerCase().includes('core') ? PersonStanding : Trophy;
          setPrograms(payload.programs.map((program: { title: string; description: string; duration: string; level: string; featured: boolean; iconKey?: string }) => ({ title: program.title, description: program.description, level: program.level || 'All levels', duration: program.duration || 'Flexible', icon: iconFor(program.title), featured: Boolean(program.featured) })));
        }

        if (Array.isArray(payload?.events) && payload.events.length) {
          setActivities(payload.events.map((event: { title: string; description: string; schedule: string; image?: string; iconKey?: string }, index: number) => {
            const iconMap: Record<string, typeof Bike> = { Bike, PersonStanding, Mountain, Waves, Users };
            const Icon = iconMap[event.iconKey as keyof typeof iconMap] || Bike;
            return [event.title, event.description, event.schedule, Icon, event.image || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80'];
          }));
        }
      } catch {
        // Keep the fallback content if the backend returns an error.
      }

      try {
        const testimonialsResponse = await fetch('/api/content/testimonials');
        const testimonialPayload = await testimonialsResponse.json();
        if (Array.isArray(testimonialPayload?.testimonials) && testimonialPayload.testimonials.length) {
          setTestimonials(testimonialPayload.testimonials.map((testimonial: { name: string; achievement?: string; quote: string; image_url?: string }) => ({ name: testimonial.name, achievement: testimonial.achievement || 'Community member', quote: testimonial.quote, image: testimonial.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80' })));
        }
      } catch {
        // Keep the fallback testimonials if the backend returns an error.
      }

      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('question, answer, display_order, status')
          .eq('status', 'active')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length) {
          setFaqs(data.map((item: { question: string; answer: string }) => ({ question: item.question, answer: item.answer })));
        }
      } catch {
        // Keep the fallback FAQs if the database is unavailable.
      }
    }
    loadContent();
  }, []);

  return <>
    <PageBackground variant="home" />
    <main className="overflow-hidden bg-[#08100f] text-white">
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        {carouselImages.map((image, index) => <div key={`${image}-${index}`} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url('${image}')` }} />)}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,14,13,.96)_0%,rgba(5,14,13,.72)_45%,rgba(5,14,13,.22)_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 pt-40 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-12">
          <div className="max-w-3xl self-center"><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#FC6129]/30 bg-[#FC6129]/10 px-4 py-2 text-xs font-bold uppercase tracking-[.24em] text-[#FC6129]"><Sparkles className="h-4 w-4" /> The Grow Fit community</div><h1 className="max-w-3xl text-6xl font-black uppercase leading-[.9] tracking-[-.05em] sm:text-8xl">{heroTitle}</h1><p className="mt-8 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">{heroSubtitle}</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={openModal} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FC6129] px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:-translate-y-1 hover:bg-white hover:text-[#15200e]">{heroCtaText} <ArrowUpRight className="h-4 w-4" /></button><Link href="#programs" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-4 text-sm font-black uppercase tracking-wider backdrop-blur transition hover:bg-white/20">Start Your Transformation <ChevronRight className="h-4 w-4" /></Link></div><div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/65"><span><strong className="text-white">27K+</strong> members growing</span><span><strong className="text-white">98%</strong> success rate</span><span><strong className="text-white">60+</strong> weekly sessions</span></div></div>
          <div className="hidden self-end justify-self-end lg:block"><div className="w-72 border-l border-[#FC6129]/60 pl-5"><p className="text-xs font-bold uppercase tracking-[.25em] text-[#FC6129]">This week at Grow Fit</p><p className="mt-3 text-2xl font-bold leading-tight">{quote.text}</p><p className="mt-4 text-sm text-white/50">{quote.author}</p></div></div>
        </div>
        <div className="absolute bottom-7 right-6 z-10 flex gap-2">{carouselImages.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} aria-label={`Show hero image ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === currentSlide ? 'w-12 bg-[#FC6129]' : 'w-5 bg-white/35'}`} />)}</div>
      </section>

      <section id="programs" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12"><ScrollReveal><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Choose your next chapter</p><h2 className="section-title">Challenges that <span>change you.</span></h2></div><p className="max-w-md text-white/55">Coaching that respects your starting point, your schedule, and the person you are becoming.</p></div></ScrollReveal><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{programs.map((program) => { const Icon = program.icon; return <ScrollReveal key={program.title} className={program.featured ? 'lg:col-span-2' : ''}><article className={`group relative h-full overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-2 ${program.featured ? 'border-[#FC6129]/40 bg-[#FC6129] text-white' : 'border-white/10 bg-white/[.06] hover:border-[#FC6129]/40'}`}><div className="flex items-start justify-between"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${program.featured ? 'bg-white/20' : 'bg-[#FC6129]/10 text-[#FC6129]'}`}><Icon className="h-5 w-5" /></div><span className={`text-xs font-bold uppercase tracking-wider ${program.featured ? 'text-white/70' : 'text-white/45'}`}>{program.duration}</span></div><h3 className="mt-12 text-2xl font-black uppercase tracking-tight">{program.title}</h3><p className={`mt-3 max-w-lg text-sm leading-relaxed ${program.featured ? 'text-white/80' : 'text-white/55'}`}>{program.description}</p><div className="mt-6 flex items-center justify-between border-t pt-4 text-xs font-bold uppercase tracking-wider" style={{ borderColor: program.featured ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)' }}><span>{program.level}</span><button onClick={openModal} className="inline-flex items-center gap-1">Join program <ArrowUpRight className="h-4 w-4" /></button></div></article></ScrollReveal> })}</div></section>

      <section className="border-y border-white/10 bg-[#101b18] px-5 py-24 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><ScrollReveal><p className="eyebrow">Beyond the gym</p><h2 className="section-title">Meet us <span>outside.</span></h2><p className="mt-5 max-w-xl text-white/55">The best kind of progress has a little fresh air, a few new friends, and a story worth telling.</p></ScrollReveal><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{activities.map(([title, description, schedule, Icon, image]) => { const ActivityIcon = Icon as typeof Bike; return <ScrollReveal key={title as string}><article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#08100f]"><div className="relative h-44 overflow-hidden"><img src={image as string} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-[#08100f] to-transparent" /></div><div className="p-5"><div className="flex items-center justify-between"><h3 className="font-bold">{title as string}</h3><ActivityIcon className="h-4 w-4 text-[#FC6129]" /></div><p className="mt-3 text-sm leading-relaxed text-white/55">{description as string}</p><p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#FC6129]">{schedule as string}</p><button onClick={openModal} className="mt-4 text-sm font-bold text-white/75 hover:text-[#FC6129]">Join activity <ArrowUpRight className="ml-1 inline h-4 w-4" /></button></div></article></ScrollReveal> })}</div></div></section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12"><ScrollReveal><p className="eyebrow">Real people. Real momentum.</p><h2 className="section-title">Proof is <span>personal.</span></h2><p className="mt-5 max-w-sm text-white/55">Every transformation starts with one honest decision and gets stronger with a community behind it.</p><button onClick={openModal} className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#FC6129]/40 px-5 py-3 text-sm font-bold text-[#FC6129] hover:bg-[#FC6129] hover:text-white">Join the next challenge <ArrowUpRight className="h-4 w-4" /></button></ScrollReveal><TestimonialCarousel testimonials={testimonials} /></section>

      <section className="relative overflow-hidden bg-[#FC6129] px-5 py-24 text-white sm:px-8 lg:px-12"><div className="absolute -right-10 -top-20 text-[20rem] font-black leading-none opacity-[.08]">GF</div><div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr]"><ScrollReveal><p className="eyebrow text-white/80">More than a workout</p><h2 className="section-title text-white">Build your <span className="text-white">network.</span></h2><p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">Train with people from different industries and fitness levels while growing your professional network. The next opportunity might be between sets.</p><div className="mt-8 flex flex-wrap gap-2">{networkRoles.map((role) => <span key={role} className="rounded-full border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-wider">{role}</span>)}</div></ScrollReveal><ScrollReveal className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[Network, Brain, Users, Award].map((Icon, index) => <div key={index} className="flex aspect-square flex-col justify-between rounded-2xl bg-white/10 p-4"><Icon className="h-6 w-6" /><span className="text-4xl font-black">0{index + 1}</span></div>)}</ScrollReveal></div></section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12"><div className="grid gap-16 lg:grid-cols-2"><ScrollReveal><p className="eyebrow">Start where you are</p><h2 className="section-title">Everyone has a <span>place here.</span></h2><div className="mt-10 space-y-3">{[['Beginner', 'A patient on-ramp, simple movement coaching, and the confidence to keep going.'], ['Intermediate', 'Structured progression, fresh challenges, and the support to break through plateaus.'], ['Advanced', 'Higher-level programming, performance goals, and a community that matches your ambition.']].map(([level, detail], index) => <div key={level} className="flex gap-4 border-t border-white/10 py-5"><span className="text-sm font-black text-[#FC6129]">0{index + 1}</span><div><h3 className="font-bold">{level}</h3><p className="mt-1 text-sm text-white/55">{detail}</p></div></div>)}</div></ScrollReveal><ScrollReveal className="relative overflow-hidden rounded-3xl bg-[#101b18] p-8 sm:p-12"><div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#FC6129]/10 blur-3xl" /><div className="relative"><p className="eyebrow">Grow Fit experts</p><h2 className="mt-4 text-4xl font-black uppercase leading-none">The room is full of <span className="text-[#FC6129]">teachers.</span></h2><p className="mt-5 text-white/55">Guest trainers, nutrition experts, coaches, and community leaders who make progress feel possible.</p><div className="mt-8 space-y-3 text-sm text-white/75">{['Monthly fitness talks', 'Live demonstrations', 'Friendly fitness competitions', 'Expert Q&A sessions'].map((item) => <div key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#FC6129]" />{item}</div>)}</div></div></ScrollReveal></div></section>

      <section className="border-y border-white/10 bg-[#101b18] px-5 py-24 sm:px-8 lg:px-12"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2"><ScrollReveal className="order-2 overflow-hidden rounded-3xl lg:order-1"><img src="https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=1200&q=80" alt="Parent and child enjoying a healthy outdoor activity" className="h-[420px] w-full object-cover" /></ScrollReveal><ScrollReveal className="order-1 lg:order-2"><p className="eyebrow">For the whole family</p><h2 className="section-title">Strong habits <span>start young.</span></h2><p className="mt-5 max-w-lg text-white/55">A polished, welcoming space for families to make movement part of how they live, not another item on the calendar.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{['Fun fitness activities', 'Weekend kids workouts', 'Family workout sessions', 'Healthy lifestyle education'].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[.04] p-4 text-sm font-bold">{item}</div>)}</div><button onClick={openModal} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FC6129] px-5 py-3 text-sm font-black text-white">Explore family fitness <ArrowUpRight className="h-4 w-4" /></button></ScrollReveal></div></section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12"><ScrollReveal><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">The movement is growing</p><h2 className="section-title">Find your <span>people.</span></h2></div><p className="max-w-md text-white/55">Small wins become a different kind of powerful when they are witnessed, shared, and celebrated.</p></div></ScrollReveal><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{communityPillars.map((pillar, index) => <ScrollReveal key={pillar}><div className="group flex min-h-32 flex-col justify-between rounded-2xl border border-white/10 bg-white/[.04] p-5 transition hover:border-[#FC6129]/50 hover:bg-[#FC6129] hover:text-white"><span className="text-xs font-bold text-[#FC6129] group-hover:text-white/80">0{index + 1}</span><span className="text-lg font-black uppercase leading-none">{pillar}</span></div></ScrollReveal>)}</div></section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12"><ScrollReveal><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Frequently asked</p><h2 className="section-title">Good questions <span>welcome.</span></h2></div><p className="max-w-md text-white/55">Everything you need to know before stepping into your next chapter.</p></div></ScrollReveal><div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{faqs.map((item) => <ScrollReveal key={item.question}><div className="h-full rounded-2xl border border-white/10 bg-white/[.04] p-6"><HelpCircle className="h-5 w-5 text-[#FC6129]" /><h3 className="mt-5 font-bold text-white">{item.question}</h3><p className="mt-3 text-sm leading-relaxed text-white/55">{item.answer}</p></div></ScrollReveal>)}</div></section>

      <section className="px-5 pb-24 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#FC6129] px-6 py-14 text-center text-white sm:px-12"><HeartPulse className="mx-auto h-8 w-8" /><h2 className="mt-5 text-4xl font-black uppercase leading-none sm:text-6xl">Your strongest chapter starts now.</h2><p className="mx-auto mt-5 max-w-xl text-white/80">Join the 90-Day Challenge and make your next 90 days count.</p><button onClick={openModal} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#121214] px-6 py-4 text-sm font-black uppercase tracking-wider text-white hover:bg-black">Join the 90-Day Challenge <ArrowUpRight className="h-4 w-4" /></button></div></section>
    </main>
  </>;
}

function TestimonialCarousel({ testimonials }: { testimonials: Array<{ name: string; achievement: string; quote: string; image: string }> }) {
  const [active, setActive] = useState(0);
  const testimonial = testimonials[active];
  return <div className="relative min-h-[360px] rounded-3xl border border-white/10 bg-white/[.05] p-6 sm:p-10"><div className="flex items-center gap-4"><img src={testimonial.image} alt={testimonial.name} className="h-16 w-16 rounded-2xl object-cover" /><div><p className="font-bold">{testimonial.name}</p><p className="text-sm text-[#FC6129]">{testimonial.achievement}</p></div></div><div className="mt-10 flex gap-1 text-[#FC6129]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div><blockquote className="mt-6 text-2xl font-bold leading-tight sm:text-3xl">“{testimonial.quote}”</blockquote><div className="absolute bottom-8 right-8 flex gap-2"><button onClick={() => setActive((active - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial" className="rounded-full border border-white/15 p-2 hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setActive((active + 1) % testimonials.length)} aria-label="Next testimonial" className="rounded-full border border-white/15 p-2 hover:bg-white/10"><ChevronRight className="h-4 w-4" /></button></div></div>;
}
