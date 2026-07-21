'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Filter, Dumbbell, Star } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import PageBackground from '@/components/PageBackground';
import GymLoading from '@/components/GymLoading';

interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
}

const MOCK_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: '3-Month Weight Loss Transformation Progress',
    image_url: '/images/hero-bg.webp',
    category: 'transformations',
    created_at: '2026-01-10T12:00:00Z',
  },
  {
    id: 2,
    title: 'Intensity Battle Ropes Session at the Gym',
    image_url: '/images/about-bg.webp',
    category: 'gym_sessions',
    created_at: '2026-02-15T12:00:00Z',
  },
  {
    id: 3,
    title: 'Outdoor Group Conditioning Fitness Event',
    image_url: '/images/events-bg.webp',
    category: 'events',
    created_at: '2026-03-20T12:00:00Z',
  },
  {
    id: 4,
    title: 'National Bodybuilding Championship Stage Poses',
    image_url: '/images/gallery-bg.webp',
    category: 'competitions',
    created_at: '2026-04-05T12:00:00Z',
  },
  {
    id: 5,
    title: 'Lean Muscle Gain Physical Definition Progress',
    image_url: '/images/hero-bg.webp',
    category: 'transformations',
    created_at: '2026-05-18T12:00:00Z',
  },
  {
    id: 6,
    title: 'Heavy Barbell Deadlift Alignment Practice',
    image_url: '/images/about-bg.webp',
    category: 'gym_sessions',
    created_at: '2026-06-01T12:00:00Z',
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All Media' },
  { value: 'transformations', label: 'Transformations' },
  { value: 'gym_sessions', label: 'Gym Sessions' },
  { value: 'events', label: 'Events' },
  { value: 'competitions', label: 'Competitions' },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    async function loadGallery() {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.warn('Failed to load gallery from Supabase, using mock data:', err);
        setItems(MOCK_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  // Auto-rotate featured carousel
  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(items.length, 5));
    }, 4000);
    return () => clearInterval(timer);
  }, [items]);

  const filteredItems = items.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const featuredItems = items.slice(0, 5);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const navigateLightbox = (direction: 'next' | 'prev') => {
    if (lightboxIndex === null) return;
    let newIndex = lightboxIndex;
    if (direction === 'next') {
      newIndex = (lightboxIndex + 1) % filteredItems.length;
    } else {
      newIndex = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    }
    setLightboxIndex(newIndex);
  };

  return (
    <>
      <PageBackground variant="gallery" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Full-width background gradient accent */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,119,255,0.015)] to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,119,255,0.04),transparent_50%),radial-gradient(circle_at_50%_70%,rgba(255,107,0,0.03),transparent_50%)]" />
      </div>

      <div className="relative z-10 space-y-16 pt-10">
        {/* Page Header */}
        <ScrollReveal className="text-center space-y-4 animate-on-scroll">
          <span className="text-[#0077ff] text-sm font-bold uppercase tracking-wider">Gallery</span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase">Transformation & Training Gallery</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm">
            Witness real results, active training schedules, outdoor challenges, and competitive achievements.
          </p>
        </ScrollReveal>

        {/* Featured Carousel Section */}
        {!loading && featuredItems.length > 0 && selectedCategory === 'all' && (
          <section className="relative rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 bg-white/40 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c]">
            <div className="relative aspect-[21/9] overflow-hidden">
              {featuredItems.map((item, idx) => (
                <div
                  key={`featured-${item.id}`}
                  className={`absolute inset-0 transition-all duration-700 cursor-pointer ${idx === featuredIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                    }`}
                  onClick={() => {
                    const globalIdx = filteredItems.findIndex(i => i.id === item.id);
                    if (globalIdx !== -1) openLightbox(globalIdx);
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image_url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-[#ff6b00] fill-[#ff6b00]" />
                      <span className="text-[10px] text-[#ff6b00] font-bold uppercase tracking-wider">Featured</span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-white">{item.title}</h3>
                    <span className="inline-block mt-1 text-[10px] bg-white/10 backdrop-blur-sm text-gray-300 font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
              {/* Featured dots */}
              <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 flex gap-1.5 z-10">
                {featuredItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setFeaturedIndex(idx); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === featuredIndex ? 'bg-[#ff6b00] w-4' : 'bg-white/40 hover:bg-white/70'
                      }`}
                    aria-label={`Go to featured ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lightbox Modal */}
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200 cursor-pointer"
          >
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
              <button
                onClick={closeLightbox}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
              {/* Left Nav */}
              <button
                onClick={() => navigateLightbox('prev')}
                className="absolute left-0 z-10 p-3 rounded-full bg-black/60 text-white border border-white/10 hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={filteredItems[lightboxIndex].image_url}
                  alt={filteredItems[lightboxIndex].title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/5"
                />
              </div>

              {/* Right Nav */}
              <button
                onClick={() => navigateLightbox('next')}
                className="absolute right-0 z-10 p-3 rounded-full bg-black/60 text-white border border-white/10 hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Caption */}
            <div className="text-center mt-6 max-w-lg space-y-2 cursor-default" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-white font-bold text-base leading-snug">
                {filteredItems[lightboxIndex].title}
              </h4>
              <span className="inline-block text-xs text-[#ff6b00] uppercase font-extrabold tracking-widest bg-[#ff6b00]/10 border border-[#ff6b00]/20 px-3 py-1 rounded-full">
                {filteredItems[lightboxIndex].category}
              </span>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-black/10 dark:border-white/5 pb-6">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4 text-[#ff6b00]" />
            <span className="text-xs uppercase font-semibold tracking-wider">Filter Media</span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${selectedCategory === cat.value
                  ? 'bg-[#0077ff] text-white'
                  : 'bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry-style Grid */}
        {loading ? (
          <GymLoading size="medium" />
        ) : filteredItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map((item, index) => (
              <ScrollReveal
                key={item.id}
                className="break-inside-avoid relative rounded-2xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 bg-white/40 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c] group cursor-pointer shadow-lg hover:border-[#ff6b00]/30 transition-all duration-300 animate-on-scroll"
              >
                <div onClick={() => openLightbox(index)}>
                  {/* Image element */}
                  <div className="relative w-full h-auto overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-auto object-cover group-hover:scale-103 transition-transform duration-300 rounded-t-2xl"
                      loading="lazy"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <span className="text-white font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] px-4 py-2 rounded-xl shadow-lg">
                        Zoom Image
                      </span>
                    </div>
                  </div>

                  {/* Media Title Footer */}
                  <div className="p-5 space-y-2 border-t border-black/10 dark:border-white/5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-xs leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-gray-600 dark:text-gray-500 pt-1">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span className="text-[#0077ff] font-extrabold">{item.category}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-2xl animate-in fade-in duration-300">
            <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-bounce" />
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">No items found matching this filter.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}