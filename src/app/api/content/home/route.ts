import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const defaultHero = {
  title: 'Grow strong. Live better.',
  subtitle: 'A premium fitness community for body transformation, accountability, and a life that feels fully switched on.',
};

const defaultQuote = {
  text: 'Consistency beats intensity. Show up for yourself daily.',
  author: 'Coach Billy',
};

const defaultPrograms = [
  { title: 'Weight Loss Program', description: 'A practical, coach-led plan for sustainable fat loss, better energy, and confidence that lasts.', duration: '12 weeks', level: 'All levels', featured: true, iconKey: 'Flame' },
  { title: '90-Day Transformation', description: 'A focused reset with training, nutrition, check-ins, and a community that keeps you moving.', duration: '90 days', level: 'Intermediate', featured: false, iconKey: 'Trophy' },
  { title: 'Push-Up Challenge', description: 'Build pressing strength and a habit of showing up with a progressive daily target.', duration: '30 days', level: 'Beginner', featured: false, iconKey: 'Dumbbell' },
];

const defaultEvents = [
  { title: 'Community Runs', description: 'Easy-paced miles, good conversation, and a stronger finish.', schedule: 'Saturdays · 7:00 AM', iconKey: 'Bike' },
  { title: 'Fitness Walks', description: 'Low-impact movement for every pace and every starting point.', schedule: 'Sundays · 8:00 AM', iconKey: 'PersonStanding' },
  { title: 'Hiking Adventures', description: 'Trade the treadmill for fresh air, new trails, and shared milestones.', schedule: 'Monthly · See calendar', iconKey: 'Mountain' },
];

export async function GET() {
  try {
    const [heroResponse, carouselResponse, quoteResponse, programsResponse, eventsResponse] = await Promise.allSettled([
      supabase.from('home_content').select('title, subtitle, cta_text, cta_url, hero_image_url, status').eq('status', 'active').order('id', { ascending: true }).limit(1).maybeSingle(),
      supabase.from('carousel_slides').select('image_id, caption').eq('status', 'active').order('order', { ascending: true }),
      supabase.from('quotes').select('text, author').eq('status', 'active').limit(1),
      supabase.from('programs').select('title, description, duration, difficulty, featured, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('events').select('title, description, event_date, location, cover_image, status').eq('status', 'active').order('event_date', { ascending: true }).limit(6),
    ]);

    const heroData = heroResponse.status === 'fulfilled' ? heroResponse.value.data : null;
    const carouselData = carouselResponse.status === 'fulfilled' ? carouselResponse.value.data : null;
    const quoteData = quoteResponse.status === 'fulfilled' ? quoteResponse.value.data : null;
    const programsData = programsResponse.status === 'fulfilled' ? programsResponse.value.data : null;
    const eventsData = eventsResponse.status === 'fulfilled' ? eventsResponse.value.data : null;

    const hero = {
      title: heroData?.title || defaultHero.title,
      subtitle: heroData?.subtitle || defaultHero.subtitle,
      ctaText: heroData?.cta_text || 'Join the Community',
      ctaUrl: heroData?.cta_url || '#join',
      heroImageUrl: heroData?.hero_image_url || null,
    };

    const carousel = (carouselData || []).map((slide: any) => slide.image_id || slide.image_url || '').filter(Boolean);
    const quote = quoteData?.[0] ? { text: quoteData[0].text, author: quoteData[0].author || 'Coach Billy' } : defaultQuote;

    const programs = (programsData || []).length
      ? (programsData || []).map((program: any) => ({
          title: program.title,
          description: program.description,
          duration: program.duration || 'Flexible',
          level: program.difficulty || 'All levels',
          featured: Boolean(program.featured),
          iconKey: program.title.toLowerCase().includes('weight') ? 'Flame' : program.title.toLowerCase().includes('pull') ? 'Target' : program.title.toLowerCase().includes('push') ? 'Dumbbell' : program.title.toLowerCase().includes('squat') ? 'Brain' : program.title.toLowerCase().includes('core') ? 'PersonStanding' : 'Trophy',
        }))
      : defaultPrograms;

    const events = (eventsData || []).length
      ? (eventsData || []).map((event: any, index: number) => ({
          title: event.title,
          description: event.description || 'A new gathering designed to help members move, connect, and celebrate progress.',
          schedule: event.event_date ? new Date(event.event_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'Upcoming',
          image: event.cover_image || null,
          iconKey: ['Bike', 'PersonStanding', 'Mountain', 'Waves', 'Users'][index % 5],
        }))
      : defaultEvents;

    return NextResponse.json({ hero, carousel, quote, programs, events });
  } catch (error) {
    console.error('Failed to load homepage content:', error);
    return NextResponse.json({ hero: defaultHero, carousel: [], quote: defaultQuote, programs: defaultPrograms, events: defaultEvents });
  }
}
