import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  return token;
}

export async function GET(request: Request) {
  const token = getAuthUser(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ testimonials: data || [] });
}

export async function POST(request: Request) {
  const token = getAuthUser(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { error } = await supabaseAdmin.from('testimonials').insert({
    name: body.name,
    role: body.role || null,
    quote: body.quote,
    achievement: body.achievement || null,
    rating: body.rating || 5,
    image_url: body.image_url || null,
    before_image_url: body.before_image_url || null,
    after_image_url: body.after_image_url || null,
    featured: Boolean(body.featured),
    status: body.status || 'active',
    display_order: Number(body.display_order || 0),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const token = getAuthUser(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { error } = await supabaseAdmin.from('testimonials').update({
    name: body.name,
    role: body.role || null,
    quote: body.quote,
    achievement: body.achievement || null,
    rating: body.rating || 5,
    image_url: body.image_url || null,
    before_image_url: body.before_image_url || null,
    after_image_url: body.after_image_url || null,
    featured: Boolean(body.featured),
    status: body.status || 'active',
    display_order: Number(body.display_order || 0),
  }).eq('id', body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const token = getAuthUser(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing testimonial id.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
