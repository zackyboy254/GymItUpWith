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
import PageBackground from '@/components/PageBackground';
import { useJoinModal } from '@/context/JoinModalContext';
import Image from 'next/image';

// Default quotes to fall back on if DB is empty or connection is not configured
const DEFAULT_QUOTES = [
  { text: "Consistency beats intensity. Show up for yourself daily. 💪", author: "Coach Billy" },
  { text: "Small progress every day leads to big results. ✨", author: "Coach Billy" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince. 🧠", author: "Coach Billy" },
  { text: "Discipline is choosing between what you want now and what you want most. 🔥", author: "Coach Billy" },
  { text: "The only bad workout is the one that didn't happen. 🏋️‍♂️", author: "Coach Billy" },
];

// High-quality real gym images for the carousel (Unsplash)
const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1920&q=80',
];

// Hero side image – real gym photo
const HERO_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1080&q=80';

export default function HomePage() {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [currentSlide, setCurrentSlide] = useState(0);
  const { openModal } = useJoinModal();

  // Dynamic Landing Page states with initial static fallbacks
  const [heroTitle, setHeroTitle] = useState('Push Your Limits With Us');
  const [heroSubtitle, setHeroSubtitle] = useState('From beginner to advanced, experience workouts designed to help you achieve peak performance and exceed your fitness goals.');
  const [ctaText, setCtaText] = useState('Join Now');
  const [ctaUrl, setCtaUrl] = useState('#join');
  const [heroImageUrl, setHeroImageUrl] = useState(HERO_IMAGE);
  const [carouselImages, setCarouselImages] = useState<string[]>(CAROUSEL_IMAGES);
  const [metrics, setMetrics] = useState<Record<string, string>>({
    metric_years: '12+',
    metric_members: '27K+',
    metric_weekly_classes: '60+',
    metric_trainers: '117+',
    metric_experience: '5+ Years',
    metric_happy_clients: '200+',
    metric_success_rate: '98%',
    metric_certifications: '15+',
    instructor_name: 'Coach Billy 💪',
    instructor_title: 'Certified Fitness Coach',
    instructor_quote: '"Fitness is not a destination; it\'s a way of living. I\'m here to equip you with the mindset, routines, and discipline to transform your life."',
    instructor_image: '/images/gym6.jpg',
    instructor_heading: 'Fueling Fitness Excellence 🏆',
    instructor_bio_p1: 'Coach Billy is a premier certified fitness instructor with years of experience pushing clients to achieve their target physiques. Billy combines scientific training methodologies, functional movement principles, and highly structured nutritional guidelines.',
    instructor_bio_p2: 'Whether you\'re looking to shed fat, build lean muscle, prepare for a marathon, or improve overall cardio endurance, the training programs here are optimized for sustainable results.',
  });

  const METRIC_SETTING_KEYS = [
    'metric_years',
    'metric_members',
    'metric_weekly_classes',
    'metric_trainers',
    'metric_experience',
    'metric_happy_clients',
    'metric_success_rate',
    'metric_certifications',
    'instructor_name',
    'instructor_title',
    'instructor_quote',
    'instructor_image',
    'instructor_heading',
    'instructor_bio_p1',
    'instructor_bio_p2',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        return carouselImages.length ? (prev + 1) % carouselImages.length : 0;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages]);

  useEffect(() => {
    if (carouselImages.length && currentSlide >= carouselImages.length) {
      setCurrentSlide(0);
    }
  }, [carouselImages.length, currentSlide]);

  useEffect(() => {
    async function loadDynamicContent() {
      // 1. Fetch Home Content
      try {
        const { data, error } = await supabase
          .from('home_content')
          .select('*')
          .eq('status', 'active')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          const message = (error.message || '').toLowerCase();
          if (message.includes('column') && message.includes('status') && message.includes('does not exist')) {
            const fallback = await supabase
              .from('home_content')
              .select('*')
              .order('id', { ascending: true })
              .limit(1)
              .maybeSingle();

            if (fallback.error) throw fallback.error;
            if (fallback.data) {
              setHeroTitle(fallback.data.title);
              setHeroSubtitle(fallback.data.subtitle);
              if (fallback.data.cta_text) setCtaText(fallback.data.cta_text);
              if (fallback.data.cta_url) setCtaUrl(fallback.data.cta_url);
              if (fallback.data.hero_image_url) setHeroImageUrl(fallback.data.hero_image_url);
            }
          } else {
            throw error;
          }
        } else if (data) {
          setHeroTitle(data.title);
          setHeroSubtitle(data.subtitle);
          if (data.cta_text) setCtaText(data.cta_text);
          if (data.cta_url) setCtaUrl(data.cta_url);
          if (data.hero_image_url || data.bg_image_id) setHeroImageUrl(data.hero_image_url || data.bg_image_id);
        }
      } catch (err) {
        console.warn('Failed to fetch home_content, using static fallback:', err);
      }

      // 2. Fetch Carousel Slides
      try {
        const { data, error } = await supabase
          .from('carousel_slides')
          .select('*')
          .eq('status', 'active')
          .order('order', { ascending: true });

        if (error) {
          const message = (error.message || '').toLowerCase();
          if (message.includes('column') && message.includes('status') && message.includes('does not exist')) {
            const fallback = await supabase
              .from('carousel_slides')
              .select('*')
              .order('order', { ascending: true });

            if (fallback.error) throw fallback.error;
            if (fallback.data && fallback.data.length > 0) {
              setCarouselImages(fallback.data.map((slide: any) => slide.image_id));
            }
          } else {
            throw error;
          }
        } else if (data && data.length > 0) {
          setCarouselImages(data.map((slide: any) => slide.image_id));
        }
      } catch (err) {
        console.warn('Failed to fetch carousel_slides, using static fallback:', err);
      }

      // 3. Fetch homepage metrics from settings
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', METRIC_SETTING_KEYS);

        if (!error && data) {
          const values: Record<string, string> = {};
          data.forEach((setting: any) => {
            values[setting.key] = setting.value;
          });
          setMetrics((prev) => ({ ...prev, ...values }));
        }
      } catch (err) {
        console.warn('Failed to fetch metric settings, using static fallbacks:', err);
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

  const instructorImage = metrics.instructor_image || '/images/gym6.jpg';

  return (
    <>
      <PageBackground variant="home" />
      <div className="space-y-32 pb-20 overflow-hidden">
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-950 via-[#0d0d1a] to-slate-950">
        {/* Full-width background gradient overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,0,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(0,119,255,0.06),transparent_50%)]" />
        </div>

        {/* Background carousel – real gym images */}
        {carouselImages.map((img, idx) => (
          <div
            key={`${img}-${idx}`}
            className={`absolute inset-0 h-full w-full select-none pointer-events-none transition-all duration-1000 ${idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
            style={{
              backgroundImage: `url('${img}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              filter: idx === currentSlide ? 'brightness(0.45) saturate(0.8)' : 'brightness(0.72)',
            }}
          />
        ))}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,107,0,0.12),transparent_30%)] pointer-events-none" />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.6),rgba(15,23,42,0.3))] pointer-events-none" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#ff6b00] shadow-lg shadow-black/20 backdrop-blur-sm">
                <Flame className="w-4 h-4" />
                Premium Fitness Coaching
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[0.98]">
                  {heroTitle}
                </h1>
                <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-slate-200">
                  {heroSubtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href={ctaUrl === '#join' || !ctaUrl ? '/contact' : ctaUrl}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] px-8 py-4 text-base font-bold text-white shadow-xl shadow-orange-500/20 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {ctaText}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                {['Personal Training', 'Strength', 'Group Classes', 'Nutrition'].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-8">
                {[
                  { key: 'metric_years', label: 'Years' },
                  { key: 'metric_members', label: 'Members' },
                  { key: 'metric_weekly_classes', label: 'Weekly Classes' },
                  { key: 'metric_trainers', label: 'Trainers' },
                ].map((stat) => (
                  <div key={stat.key} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-center shadow-xl shadow-black/15 backdrop-blur-sm">
                    <p className="text-2xl font-black text-white">{metrics[stat.key]}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[#ff6b00]/30 via-[#ff2a2a]/15 to-[#0077ff]/15 blur-3xl opacity-90" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/80 h-[420px] sm:h-[520px] lg:h-[620px]">
                <img
                  src={heroImageUrl}
                  alt="Fitness training session"
                  className="h-full w-full object-cover object-center"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    target.src = instructorImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
                  <div className="rounded-[2rem] border border-white/10 bg-black/60 p-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#ff6b00]">High Performance Training</p>
                    <p className="mt-3 text-white text-lg font-semibold">Your strongest self starts here</p>
                    <p className="text-slate-300 text-sm mt-2">Transform · Elevate · Dominate</p>
                  </div>
                  <div className="mt-4 grid grid-cols-6 gap-2">
                    {carouselImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'col-span-2 bg-[#ff6b00]' : 'col-span-1 bg-white/30 hover:bg-white/55'}`}
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
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide
                ? 'bg-[#ff6b00] scale-125 shadow-lg shadow-orange-500/50'
                : 'bg-white/30 hover:bg-white/55'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─── About Section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden w-full py-16">
        {/* Full-width background overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,119,255,0.06),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,107,0,0.04),transparent_50%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual Showcase */}
            <ScrollReveal className="relative animate-slide-left">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#0077ff] opacity-15 blur-xl" />
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-[#121214] flex flex-col justify-end p-8">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />
                <div
                  className="absolute inset-0 overflow-hidden bg-cover bg-center bg-no-repeat scale-105 hover:scale-100 transition-transform duration-700"
                  style={{ backgroundImage: `url('${instructorImage}')`, overflow: 'hidden', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}
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
                  <span className="block text-3xl font-black text-gray-900 dark:text-white">{metrics.metric_experience}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Training Experience</span>
                </div>
                <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-colors">
                  <span className="block text-3xl font-black text-gray-900 dark:text-white">{metrics.metric_happy_clients}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Happy Clients</span>
                </div>
                <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#ff6b00]/30 transition-colors">
                  <span className="block text-3xl font-black text-[#ff6b00]">{metrics.metric_success_rate}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Success Rate</span>
                </div>
                <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#0077ff]/30 transition-colors">
                  <span className="block text-3xl font-black text-[#0077ff]">{metrics.metric_certifications}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Certifications</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── Services Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden w-full py-16">
        {/* Full-width background overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,107,0,0.05),transparent_50%),radial-gradient(circle_at_80%_50%,rgba(0,119,255,0.04),transparent_50%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[#0077ff] text-sm font-bold uppercase tracking-wider">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white uppercase">Professional Fitness Programs ✨</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Expertly designed training tracks tailored to meet your unique physical goals and scheduling availability.
            </p>
          </div>

          <ScrollReveal className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children animate-on-scroll">
            {/* Card 1 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-2xl space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.08),transparent_45%)] pointer-events-none" />
              <div className="absolute right-0 top-4 h-16 w-16 rounded-full bg-[#ff6b00]/10 blur-2xl pointer-events-none" />
              <div className="absolute left-0 bottom-8 h-14 w-14 rounded-full bg-[#0077ff]/10 blur-2xl pointer-events-none" />
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
        </div>
      </section>

      {/* ─── Motivational Quote Section ──────────────────────────── */}
      {quote.text && (
        <section className="relative py-24 overflow-hidden  w-full">
          <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80')" }} />
          {/* Full-width background overlay */}
          {/* <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,107,0,0.08),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(0,119,255,0.06),transparent_50%)]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/90 via-[#0a0a0c]/80 to-[#0a0a0c]/95" /> */}

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
      <section className="relative overflow-hidden w-full py-16 px-4 sm:px-6 lg:px-8">
        {/* Full-width background overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,107,0,0.06),transparent_50%),radial-gradient(circle_at_50%_70%,rgba(0,119,255,0.04),transparent_50%)]" />
        </div>
        <div className="max-w-7xl mx-auto">
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
        </div>
      </section>
    </div>
    </>
  );
}