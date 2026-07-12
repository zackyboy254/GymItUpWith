// src/app/api/admin/home_content/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Simple Zod schema for home content (adjust fields as needed)
const HomeContentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  hero_image_url: z.string().url().optional(),
  description: z.string().optional(),
});

async function isAdmin(session: any) {
  // Assuming admin role is stored in session.user.role
  return session?.user?.role === 'admin';
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin.from('home_content').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const json = await request.json();
  const parsed = HomeContentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  // Sanitize any HTML fields (if present)
  const sanitized = { ...parsed.data };
  if (sanitized.description) {
    sanitized.description = DOMPurify.sanitize(sanitized.description);
  }
  const { data, error } = await supabaseAdmin.from('home_content').insert(sanitized);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Audit log
  await supabaseAdmin.from('admin_audit').insert({
    admin_id: session.user.id,
    action: 'create',
    target_type: 'home_content',
    target_id: data[0].id,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const json = await request.json();
  const parsed = HomeContentSchema.safeParse(json);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: 'Invalid payload or missing id' }, { status: 400 });
  }
  const { id, ...rest } = parsed.data;
  if (rest.description) {
    rest.description = DOMPurify.sanitize(rest.description);
  }
  const { data, error } = await supabaseAdmin.from('home_content').update(rest).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from('admin_audit').insert({
    admin_id: session.user.id,
    action: 'update',
    target_type: 'home_content',
    target_id: id,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id query param' }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from('home_content').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from('admin_audit').insert({
    admin_id: session.user.id,
    action: 'delete',
    target_type: 'home_content',
    target_id: id,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json({ success: true });
}
