import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('name, role, quote, achievement, rating, image_url, featured, status, display_order')
      .eq('status', 'active')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ testimonials: [] }, { status: 500 });
    }

    return NextResponse.json({
      testimonials: (data || []).map((item: any) => ({
        name: item.name,
        achievement: item.achievement || 'Community member',
        quote: item.quote,
        image: item.image_url || null,
        rating: item.rating || 5,
        featured: Boolean(item.featured),
      })),
    });
  } catch (error) {
    console.error('Failed to load testimonials:', error);
    return NextResponse.json({ testimonials: [] });
  }
}
