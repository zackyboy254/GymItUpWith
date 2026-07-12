'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Flame, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface DailyPopupData {
  id: number;
  title: string;
  message: string;
  cta_text: string;
  cta_link: string;
  image_url: string | null;
  popup_type: string; // 'motivation' | 'promo' | 'event' | 'tip'
}

const DEFAULT_POPUP: DailyPopupData = {
  id: 0,
  title: 'Sweat. Smile. Repeat. 💪',
  message: 'Every rep counts. Every set matters. Show up for yourself today and crush your fitness goals with Gym It Up With!',
  cta_text: 'Start Your Journey',
  cta_link: '/contact',
  image_url: '/images/hero-bg.webp',
  popup_type: 'motivation',
};

const STORAGE_KEY = 'gymitupwith_popup_dismissed';

export default function DailyPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [popupData, setPopupData] = useState<DailyPopupData | null>(null);

  useEffect(() => {
    // Check if popup was dismissed today
    const dismissedDate = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    if (dismissedDate === today) {
      return; // Already dismissed today
    }

    // Fetch today's popup from DB
    async function fetchPopup() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[new Date().getDay()];

        // 1. Try popup scheduled for today's exact date
        const { data: scheduledPopup } = await supabase
          .from('daily_popups')
          .select('*')
          .eq('status', 'active')
          .eq('scheduled_date', todayStr)
          .limit(1)
          .maybeSingle();

        if (scheduledPopup) {
          setPopupData(scheduledPopup);
        } else {
          // 2. Try popup assigned to today's day of week
          const { data: dayPopup } = await supabase
            .from('daily_popups')
            .select('*')
            .eq('status', 'active')
            .eq('day_of_week', todayName)
            .limit(1)
            .maybeSingle();

          if (dayPopup) {
            setPopupData(dayPopup);
          } else {
            // 3. Fallback to latest active popup
            const { data: latestPopup } = await supabase
              .from('daily_popups')
              .select('*')
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            setPopupData(latestPopup || DEFAULT_POPUP);
          }
        }
      } catch {
        setPopupData(DEFAULT_POPUP);
      }

      // Show popup after a 2-second delay
      setTimeout(() => setIsVisible(true), 2000);
    }

    fetchPopup();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY, today);
  };

  if (!isVisible || !popupData) return null;

  const typeColors: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
    motivation: { bg: 'from-[#ff6b00]/10', border: 'border-[#ff6b00]/30', icon: 'text-[#ff6b00]', badge: 'bg-[#ff6b00]/10 text-[#ff6b00] border-[#ff6b00]/20' },
    promo: { bg: 'from-[#0077ff]/10', border: 'border-[#0077ff]/30', icon: 'text-[#0077ff]', badge: 'bg-[#0077ff]/10 text-[#0077ff] border-[#0077ff]/20' },
    event: { bg: 'from-[#ff2a2a]/10', border: 'border-[#ff2a2a]/30', icon: 'text-[#ff2a2a]', badge: 'bg-[#ff2a2a]/10 text-[#ff2a2a] border-[#ff2a2a]/20' },
    tip: { bg: 'from-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  };
  const colors = typeColors[popupData.popup_type] || typeColors.motivation;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm popup-backdrop"
        onClick={handleDismiss}
      />

      {/* Popup Card */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className={`pointer-events-auto popup-card w-full max-w-md rounded-3xl overflow-hidden glass-panel border ${colors.border} bg-gradient-to-br ${colors.bg} to-[#0a0a0c] shadow-2xl`}>
          {/* Image Banner */}
          {popupData.image_url && (
            <div className="relative h-48 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${popupData.image_url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />

              {/* Logo overlay */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <img
                  src="/images/logo.webp"
                  alt="Gym It Up With"
                  className="w-10 h-10 rounded-xl border border-white/20 object-cover"
                />
                <span className="font-extrabold text-sm text-white tracking-wider">
                  GYM IT UP <span className="text-[#ffd700]">WITH</span>
                </span>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-4">
            {!popupData.image_url && (
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.badge} border`}>
                  {popupData.popup_type === 'motivation' ? <Flame className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Badge */}
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors.badge}`}>
              <Flame className="w-3 h-3" />
              {popupData.popup_type === 'motivation' ? 'Daily Motivation' : popupData.popup_type === 'event' ? 'Upcoming Event' : popupData.popup_type === 'promo' ? 'Special Offer' : 'Fitness Tip'}
            </span>

            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-snug">
              {popupData.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {popupData.message}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href={popupData.cta_link}
                onClick={handleDismiss}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 font-bold text-white bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] rounded-xl hover:from-[#ff2a2a] hover:to-[#ff6b00] transition-all duration-300 shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] pulse-ring"
              >
                {popupData.cta_text}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
              <button
                onClick={handleDismiss}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 font-bold text-sm transition-all cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
