'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Flame,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  Users,
  Compass,
  Zap,
  Target,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import { useJoinModal } from '@/context/JoinModalContext';
import Image from 'next/image';

const BASE = 'https://bqgcorqknezxigssfdaz.supabase.co/storage/v1/object/public/gym-images/hero';

// Default quotes to fall back on if DB is empty or connection is not configured
const DEFAULT_QUOTES = [
  { text: "Consistency beats intensity. Show up for yourself daily. 💪", author: "Coach Billy" },
  { text: "Small progress every day leads to big results. ✨", author: "Coach Billy" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince. 🧠", author: "Coach Billy" },
  { text: "Discipline is choosing between what you want now and what you want most. 🔥", author: "Coach Billy" },
  { text: "The only bad workout is the one that didn't happen. 🏋️‍♂️", author: "Coach Billy" },
];

// All 12 gym images uploaded to Supabase Storage
const CAROUSEL_IMAGES = [
  `${BASE}/unnamed__5_.jpg`,
  `${BASE}/unnamed__6_.jpg`,
  `${BASE}/unnamed__10_.jpg`,
  `${BASE}/unnamed__1_.jpg`,
  `${BASE}/unnamed__7_.jpg`,
  `${BASE}/unnamed__8_.jpg`,
  `${BASE}/images.jpg`,
  `${BASE}/unnamed__9_.jpg`,
  `${BASE}/unnamed__2_.jpg`,
  `${BASE}/unnamed__3_.jpg`,
  `${BASE}/unnamed__4_.jpg`,
  `${BASE}/unnamed.jpg`,
];

// Hero side image – high-energy Unsplash training photo
const HERO_IMAGE = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=80';

export default function HomePage() {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [currentSlide, setCurrentSlide] = useState(0);
  const { openModal } = useJoinModal();

  // Dynamic Landing Page states with initial static fallbacks
  const [heroTitle, setHeroTitle] = useState('Push Your Limits Shape Your Destiny');
  const [heroSubtitle, setHeroSubtitle] = useState('Welcome to GymItUpWith Billy. Custom-tailored workouts, results-oriented training plans, and a community dedicated to excellence. 💪');
  const [ctaText, setCtaText] = useState('Join Program');
  const [ctaUrl, setCtaUrl] = useState('#join');
  const [heroImageUrl, setHeroImageUrl] = useState(HERO_IMAGE);
  const [carouselImages, setCarouselImages] = useState<string[]>(CAROUSEL_IMAGES);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages]);

  useEffect(() => {
    async function loadDynamicContent() {
      // 1. Fetch Home Content
      try {
        const { data, error } = await supabase
          .from('home_content')
          .select('*')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setHeroTitle(data.title);
          setHeroSubtitle(data.subtitle);
          if (data.cta_text) setCtaText(data.cta_text);
          if (data.cta_url) setCtaUrl(data.cta_url);
          if (data.hero_image_url) setHeroImageUrl(data.hero_image_url);
        }
      } catch (err) {
        console.warn('Failed to fetch home_content, using static fallback:', err);
      }

      // 2. Fetch Carousel Slides
      try {
        const { data, error } = await supabase
          .from('carousel_slides')
          .select('*')
          .order('order', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setCarouselImages(data.map((slide: any) => slide.image_id));
        }
      } catch (err) {
        console.warn('Failed to fetch carousel_slides, using static fallback:', err);
      }
    }
    loadDynamicContent();
  }, []);

  useEffect(() => {
    async function loadQuote() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: scheduledQuote } = await supabase
          .from('quotes')
          .select('text, author')
          .eq('status', 'active')
          .eq('scheduled_date', todayStr)
          .limit(1)
          .maybeSingle();

        if (scheduledQuote) {
          setQuote(scheduledQuote);
          return;
        }

        const { data: randomQuote } = await supabase
          .from('quotes')
          .select('text, author')
          .eq('status', 'active')
          .limit(1);

        if (randomQuote && randomQuote.length > 0) {
          setQuote(randomQuote[0]);
        } else {
          setQuote(DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)]);
        }
      } catch (err) {
        console.warn('Failed to fetch quote from Supabase, using default:', err);
        setQuote(DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)]);
      }
    }
    loadQuote();
  }, []);

  return (
    <div className="space-y-32 pb-20 overflow-hidden">
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-black">

        {/* Background carousel – gym images, clearly visible */}
        {carouselImages.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 z-0 select-none pointer-events-none transition-all duration-1000 ${
              idx === currentSlide ? 'opacity-70 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url('${img}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}

        {/* Gradient overlay – light enough to let images show through */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-transparent to-black/65" />

        {/* Grid pattern */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* ── Side-by-side layout ───────────────────────────────────── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh] py-24">

            {/* Left – text content */}
            <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-xs text-[#ff6b00] animate-pulse self-center lg:self-start">
                <Flame className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Premium Fitness Coaching ⚡</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05] select-none whitespace-pre-line">
                {heroTitle}
              </h1>

              <p className="text-gray-300 text-lg sm:text-xl max-w-xl leading-relaxed font-light mx-auto lg:mx-0">
                {heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {ctaUrl.startsWith('/') || ctaUrl.startsWith('#') ? (
                  <Link
                    href={ctaUrl === '#join' ? '/contact' : ctaUrl}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    {ctaText} ⚡
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                ) : (
                  <button
                    onClick={openModal}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    {ctaText} ⚡
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
                <button
                  onClick={openModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                >
                  Contact Coach 📞
                </button>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8 justify-center lg:justify-start pt-4">
                <div className="text-center">
                  <span className="block text-2xl font-black text-white">5+</span>
                  <span className="text-xs text-gray-400 font-medium">Years Exp.</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <span className="block text-2xl font-black text-[#ff6b00]">200+</span>
                  <span className="text-xs text-gray-400 font-medium">Clients</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <span className="block text-2xl font-black text-[#0077ff]">98%</span>
                  <span className="text-xs text-gray-400 font-medium">Success Rate</span>
                </div>
              </div>
            </div>

            {/* Right – hero image */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Glow ring */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#ff6b00]/30 to-[#0077ff]/20 blur-2xl opacity-70" />

              {/* Floating image card */}
              <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/60">
                {/* Main image */}
                <img
                  src={heroImageUrl}
                  alt="Fitness training session"
                  className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                />
                {/* Subtle gradient on top of image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Bottom motivational tag + slide indicators */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <span className="block text-[#ff6b00] text-[10px] font-bold uppercase tracking-widest">Transform · Elevate · Dominate</span>
                    <span className="block text-white font-semibold text-sm opacity-90">Your strongest self starts here 🔥</span>
                  </div>
                  {/* Slide indicator pills */}
                  <div className="flex flex-col gap-1.5">
                    {CAROUSEL_IMAGES.slice(0, 6).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-1 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentSlide % 6
                            ? 'h-6 bg-[#ff6b00]'
                            : 'h-3 bg-white/30 hover:bg-white/55'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide dot indicators (mobile) */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2 lg:hidden">
          {CAROUSEL_IMAGES.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide % 8
                  ? 'bg-[#ff6b00] scale-125 shadow-lg shadow-orange-500/50'
                  : 'bg-white/30 hover:bg-white/55'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─── About Section ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual Showcase */}
          <ScrollReveal className="relative animate-slide-left">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#0077ff] opacity-15 blur-xl" />
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-[#121214] flex flex-col justify-end p-8">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center scale-105 hover:scale-100 transition-transform duration-700"
                style={{ backgroundImage: "url('/images/gym6.jpg')" }}
              />
              <div className="relative z-20 space-y-2">
                <span className="text-[#ff6b00] text-xs font-bold uppercase tracking-widest">Certified Fitness Coach</span>
                <h3 className="text-2xl font-black text-white">Coach Billy 💪</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  "Fitness is not a destination; it's a way of living. I'm here to equip you with the mindset, routines, and discipline to transform your life."
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Biography Text */}
          <ScrollReveal className="space-y-8 animate-slide-right">
            <div className="space-y-4">
              <span className="text-[#ff6b00] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                About The Instructor
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">
                Fueling Fitness Excellence 🏆
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                Coach Billy is a premier certified fitness instructor with years of experience pushing clients to achieve their target physiques. Billy combines scientific training methodologies, functional movement principles, and highly structured nutritional guidelines.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                Whether you're looking to shed fat, build lean muscle, prepare for a marathon, or improve overall cardio endurance, the training programs here are optimized for sustainable results.
              </p>
            </div>

            {/* Achievements stats */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-black/10 dark:border-white/5">
              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                <span className="block text-3xl font-black text-gray-900 dark:text-white">5+ Years</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Training Experience</span>
              </div>
              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                <span className="block text-3xl font-black text-gray-900 dark:text-white">200+</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Happy Clients</span>
              </div>
              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#ff6b00]/30 transition-colors">
                <span className="block text-3xl font-black text-[#ff6b00]">98%</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Success Rate</span>
              </div>
              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#0077ff]/30 transition-colors">
                <span className="block text-3xl font-black text-[#0077ff]">15+</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Certifications</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Services Section ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-[#0077ff] text-sm font-bold uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white uppercase">Professional Fitness Programs ✨</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Expertly designed training tracks tailored to meet your unique physical goals and scheduling availability.
          </p>
        </div>

        <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children animate-on-scroll">
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#ff6b00]/10 to-transparent rounded-tr-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 flex items-center justify-center text-[#ff6b00] group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#ff6b00] transition-colors">Personal Training</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              One-on-one session layouts at premium gym facilities. Tailored movement correction, real-time motivational prompts, and optimized intensity.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0077ff]/10 to-transparent rounded-tr-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-[#0077ff]/10 border border-[#0077ff]/20 flex items-center justify-center text-[#0077ff] group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0077ff] transition-colors">Group Training</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Energetic group workouts and bootcamps that cultivate a highly motivated peer structure to help you push past limits collectively.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-tr-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-[#ff2a2a]/10 border border-[#ff2a2a]/20 flex items-center justify-center text-[#ff2a2a] group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#ff2a2a] transition-colors">Online Coaching</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Access workout regimens, exercise breakdowns, and video check-ins from anywhere in the world through a robust custom plan.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#ff6b00]/10 to-transparent rounded-tr-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 flex items-center justify-center text-[#ff6b00] group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#ff6b00] transition-colors">Weight Loss Programs</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Highly integrated cardiovascular routines and conditioning schemas engineered to trigger massive calorie deficits and preserve muscle.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0077ff]/10 to-transparent rounded-tr-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-[#0077ff]/10 border border-[#0077ff]/20 flex items-center justify-center text-[#0077ff] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0077ff] transition-colors">Muscle Gain Programs</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Hypertrophy training targeting progressive strength, precise muscle group activation, and bulk programming strategies.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/10 to-transparent rounded-tr-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-400 transition-colors">Nutrition Guidance</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Customized meal planning structures aligned with physical demands, macro-nutrient targets, and your dietary preferences.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Motivational Quote Section ──────────────────────────── */}
      {quote.text && (
        <section className="relative py-24 overflow-hidden bg-black">
          <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url('${BASE}/unnamed__10_.jpg')` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-[#0a0a0c]/90 to-[#0a0a0c]" />

          <ScrollReveal className="max-w-4xl mx-auto px-4 text-center relative z-10 animate-scale-in">
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-xs text-[#ff6b00] mb-8">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-semibold uppercase tracking-wider text-[9px]">Daily Motivation</span>
            </div>

            <blockquote className="space-y-6">
              <p className="text-3xl sm:text-5xl font-black text-white italic tracking-tight leading-relaxed">
                &ldquo;{quote.text}&rdquo;
              </p>
              <cite className="block text-sm font-bold tracking-widest text-[#0077ff] uppercase not-italic">
                — {quote.author}
              </cite>
            </blockquote>
          </ScrollReveal>
        </section>
      )}

      {/* ─── CTA Section ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="relative rounded-3xl overflow-hidden glass-panel p-12 lg:p-20 text-center space-y-8 border border-white/10 bg-gradient-to-br from-[#121214] via-[#0d0d0f] to-[#0a0a0c] animate-scale-in">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ff6b00]/5 rounded-full blur-[100px] pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Ready to Gym it Up with Billy? 🏋️‍♂️
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Take the first step. Get in touch with Coach Billy today, choose your fitness track, and begin your ultimate transformation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={openModal}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              Get Started Now ⚡
            </button>
            <Link
              href="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              View Client Gallery 🖼️
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
