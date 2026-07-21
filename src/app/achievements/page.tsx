'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Award, Calendar, ShieldCheck, Dumbbell } from 'lucide-react';
import GymLoading from '@/components/GymLoading';

interface Achievement {
  id: number;
  title: str
  description: string;
  image_url: string;
  achievement_date: string;
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    title: 'Certified Personal Fitness Trainer',
    description: 'Accredited international personal trainer certification covering anatomical training sciences, biomechanics, exercise programming, and client progress assessment metrics.',
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600',
    achievement_date: '2022-06-15',
  },
  {
    id: 2,
    title: 'Certified Sports Nutritionist Specialist',
    description: 'Professional certification focusing on macro-nutrient distribution schemas, optimal hydration, calorie calculation strategies, and pre/post-workout meal templates.',
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    achievement_date: '2023-03-10',
  },
  {
    id: 3,
    title: 'Nairobi Fitness Expo Champion - Men Physique',
    description: 'Awarded first place in the Nairobi regional fitness expo, showcasing elite physical development, muscle symmetry, core conditioning, and posing excellence.',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
    achievement_date: '2024-11-20',
  },
  {
    id: 4,
    title: 'First Aid & CPR Safety Certification',
    description: 'Full certification in cardiac pulmonary resuscitation (CPR) and emergency first aid procedures to ensure maximum safety profiles for all clients during high-intensity training.',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600',
    achievement_date: '2025-02-18',
  },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('status', 'active')
          .order('achievement_date', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setAchievements(data);
        } else {
          setAchievements([]);
        }
      } catch (err) {
        console.warn('Failed to load achievements from Supabase, using mock data:', err);
        setAchievements(MOCK_ACHIEVEMENTS);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Full-width background gradient accent */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,119,255,0.015)] to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,119,255,0.04),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,107,0,0.03),transparent_50%)]" />
      </div>

      <div className="relative z-10 space-y-16 pt-10">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <span className="text-[#0077ff] text-sm font-bold uppercase tracking-wider">Credentials</span>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white uppercase">Coach Certifications & Awards</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm">
            A certified instructor dedicated to the highest standards of safety, scientific program layouts, and athletic excellence.
          </p>
        </div>

        {/* Grid List */}
        {loading ? (
          <GymLoading size="medium" />
        ) : achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c] hover:border-[#0077ff]/30 transition-all duration-300 flex flex-col sm:flex-row"
              >
                {/* Image panel */}
                <div className="sm:w-2/5 relative aspect-video sm:aspect-auto min-h-[200px] bg-black">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image_url})` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/50 to-transparent"></div>
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-[#0077ff]/20 backdrop-blur-md border border-[#0077ff]/40 flex items-center justify-center text-[#0077ff]">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                {/* Info panel */}
                <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified Credential</span>
                    </div>
                    <h2 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg hover:text-[#0077ff] transition-colors uppercase leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-gray-500 pt-3 border-t border-black/10 dark:border-white/5">
                    <Calendar className="w-3.5 h-3.5 text-[#ff6b00]" />
                    <span>Obtained: {new Date(item.achievement_date).toLocaleDateString([], { year: 'numeric', month: 'long' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-2xl animate-in fade-in duration-300">
            <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-bounce" />
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">No certificates or awards registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}