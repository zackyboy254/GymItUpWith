'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, ExternalLink, Flame, Dumbbell } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import GymLoading from '@/components/GymLoading';

interface EventItem {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  cover_image: string;
  registration_link: string;
}

const MOCK_EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'Nairobi Core & Conditioning Bootcamp',
    description: 'An intense 3-hour outdoor conditioning boot camp focusing on building abdominal power, fat burning circuits, dynamic team relays, and flexibility training. Suitable for all fitness levels.',
    event_date: '2026-07-18T07:00:00Z',
    location: 'Nairobi Arboretum, Nairobi, Kenya',
    cover_image: '/images/events-bg.webp',
    registration_link: 'https://wa.me/+254 793 62542?text=I%20want%20to%20register%20for%20the%20Nairobi%20Bootcamp',
  },
  {
    id: 2,
    title: '30-Day Ultimate Body Fat Burn Challenge',
    description: 'Kickstart your fat loss journey with Coach Billy. High-intensity home workouts, detailed grocery lists, weekly check-ins, and group motivation. Access through WhatsApp support community.',
    event_date: '2026-08-01T00:00:00Z',
    location: 'Online / WhatsApp Group (Kenya)',
    cover_image: '/images/hero-bg.webp',
    registration_link: 'https://wa.me/+254 793 62542?text=I%20want%20to%20join%20the%2030-Day%20Fat%20Burn%20Challenge',
  },
  {
    id: 3,
    title: 'Mt. Kenya Outdoor Hiking & Fitness Camp',
    description: 'Test your endurance! A 2-day outdoor elevation challenge including hiking, altitude workouts, breathing exercises, and healthy meal preps at the base camp. Transportation included.',
    event_date: '2026-09-12T05:00:00Z',
    location: 'Mt. Kenya National Park, Kenya',
    cover_image: '/images/gallery-bg.webp',
    registration_link: 'https://wa.me/+254 793 62542?text=I%20want%20to%20register%20for%20the%20Mt%20Kenya%20Hiking%20Camp',
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .order('event_date', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.warn('Failed to load events from Supabase, using mock data:', err);
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Fixed Background Image */}
      <div
        className="absolute inset-0 z-0 select-none pointer-events-none opacity-5 dark:opacity-10 bg-cover bg-center bg-no-repeat fixed bg-fixed min-h-[100vh]"
        style={{ backgroundImage: "url('/images/events-bg.webp')" }}
      ></div>

      <div className="relative z-10 space-y-16 pt-10">
        {/* Page Header */}
        <ScrollReveal className="text-center space-y-4 animate-on-scroll">
          <span className="text-[#ff2a2a] text-sm font-bold uppercase tracking-wider">Upcoming Challenges</span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase">Fitness Events & Bootcamps</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm">
            Join our fitness community. Secure your spot in our outdoor training camps, group challenges, and altitude expeditions.
          </p>
        </ScrollReveal>

        {/* Events List */}
        {loading ? (
          <GymLoading size="medium" />
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-12">
            {events.map((event) => (
              <ScrollReveal key={event.id} className="animate-on-scroll">
                <div
                  className="glass-panel rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10 border border-black/10 dark:border-white/10 bg-white/40 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c] hover:border-[#ff2a2a]/30 transition-all duration-300 relative group"
                >
                  {/* Event Image */}
                  <div className="lg:col-span-5 relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-black/5 dark:border-white/5">
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url(${event.cover_image})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  {/* Event Info */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      {/* Category Pill */}
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ff2a2a]/10 border border-[#ff2a2a]/20 text-xs text-[#ff2a2a]">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Bootcamp / Challenge</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight leading-snug">
                        {event.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/5">
                      {/* Meta items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                          <Calendar className="w-5 h-5 text-[#ff6b00]" />
                          <div>
                            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date & Time</span>
                            <span className="text-xs font-semibold">
                              {new Date(event.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                          <MapPin className="w-5 h-5 text-[#0077ff]" />
                          <div>
                            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Location</span>
                            <span className="text-xs font-semibold">{event.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Register CTA */}
                      <div className="pt-4 flex">
                        <a
                          href={event.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] rounded-xl hover:from-[#ff2a2a] hover:to-[#ff6b00] transition-all duration-300 cursor-pointer shadow-lg shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Register Now
                          <ExternalLink className="w-4 h-4 ml-1.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-2xl animate-in fade-in duration-300">
            <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-bounce" />
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">No events scheduled at the moment. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
