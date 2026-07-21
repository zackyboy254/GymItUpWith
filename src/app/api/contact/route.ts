import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into DB (server-side admin client)
    try {
      await supabaseAdmin.from('contact_requests').insert([
        { name, email, phone: phone || null, message, status: 'pending' },
      ]);
    } catch (dbErr) {
      console.warn('Failed to insert contact_request via admin client:', dbErr);
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
          subject: `Website Contact: ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
          html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || 'N/A'}</p><hr/><p>${message}</p>`,
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
