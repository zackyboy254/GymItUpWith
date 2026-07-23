import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { PROGRAM_OPTIONS } from '@/lib/programs';

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  program: z.enum(PROGRAM_OPTIONS),
  preferredDate: z.string().date().optional().or(z.literal('')),
  message: z.string().trim().min(5).max(2000),
});

const recentRequests = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const previousRequest = recentRequests.get(forwardedFor);
    if (previousRequest && now - previousRequest < 30_000) {
      return NextResponse.json({ error: 'Please wait a moment before submitting another request.' }, { status: 429 });
    }
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please check your registration details and try again.' }, { status: 400 });
    }
    const { name, email, phone, program, preferredDate, message } = parsed.data;
    recentRequests.set(forwardedFor, now);

    // Insert into DB (server-side admin client)
    const { error: databaseError } = await supabaseAdmin.from('contact_requests').insert([
      { name, email, phone: phone || null, program, preferred_date: preferredDate || null, message, status: 'pending' },
    ]);
    if (databaseError) {
      console.error('Failed to insert registration:', databaseError.message);
      return NextResponse.json({ error: 'We could not save your request. Please try again shortly.' }, { status: 503 });
    }

    // Send email if SMTP config is present
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const receiver = process.env.CONTACT_RECEIVER || process.env.CONTACT_EMAIL || 'chibudangote1561@gmail.com';

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mail = {
          from: `${name} <${email}>`,
          to: receiver,
          subject: `Grow Fit registration: ${program}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nProgram: ${program}\nPreferred date: ${preferredDate || 'N/A'}\n\nNotes:\n${message}`,
          html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || 'N/A'}</p><p><strong>Program:</strong> ${program}</p><p><strong>Preferred date:</strong> ${preferredDate || 'N/A'}</p><hr/><p>${message}</p>`,
        };

        await transporter.sendMail(mail);
      } catch (mailErr) {
        console.warn('Failed to send contact email:', mailErr);
        // Don't fail the request if mail sending fails; DB record exists.
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
