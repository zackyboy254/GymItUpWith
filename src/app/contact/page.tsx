'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import PageBackground from '@/components/PageBackground';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Contact API error:', data);
        setStatus('error');
        setErrorMessage(data?.error || 'Failed to submit message');
        return;
      }
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: unknown) {
      console.error('Contact submission error:', err);
      setStatus('error');
      setErrorMessage('Failed to submit message. Please try again later.');
    }
  };

  return (
    <>
      <PageBackground variant="contact" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16 pt-10">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <span className="text-[#FC6129] text-sm font-bold uppercase tracking-wider">Get in Touch</span>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white uppercase">Contact Coach Billy</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm">
            Have questions about pricing, bootcamps, or personal training? Drop a message below or initiate a chat instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Form Section */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-8 border border-black/10 dark:border-white/10 bg-white/60 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c] space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Send a Message</h2>

            {status === 'success' && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-1">Thank you. Coach Billy will respond to your email or phone number shortly.</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Submission Error</h4>
                  <p className="text-xs text-rose-600/80 dark:text-rose-500/80 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Full Name <span className="text-[#ff2a2a]">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#FC6129] transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +254 793 62542"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#FC6129] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Email Address <span className="text-[#ff2a2a]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. johndoe@gmail.com"
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#FC6129] transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Your Message <span className="text-[#ff2a2a]">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your training goals or details..."
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#FC6129] transition-colors resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 font-bold text-white bg-gradient-to-r from-[#FC6129] to-[#ff2a2a] hover:from-[#ff2a2a] hover:to-[#FC6129] rounded-xl shadow-lg shadow-orange-500/15 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:bg-white/5 disabled:text-gray-500"
              >
                {status === 'submitting' ? (
                  'Submitting Message...'
                ) : (
                  <>
                    Send Message
                    <Send className="w-4.5 h-4.5 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Links & Map */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
            <div className="glass-panel rounded-3xl p-8 border border-black/10 dark:border-white/10 bg-white/60 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c] space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Direct Channels</h2>

              <div className="grid grid-cols-1 gap-4">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/254793625426?text=Hello%20Coach%20Billy%2C%20I%20visited%20your%20website%20and%20want%20to%20learn%20more%20about%20your%20coaching%20programs%21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5.5 h-5.5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">WhatsApp</span>
                    <span className="text-sm font-extrabold">Chat Instantly</span>
                  </div>
                </a>

                {/* Call */}
                <a
                  href="tel:+254793625426"
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-[#FC6129]/5 border border-[#FC6129]/10 hover:border-[#FC6129]/30 text-[#FC6129] hover:bg-[#FC6129]/10 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FC6129]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5.5 h-5.5 text-[#FC6129]" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Phone Call</span>
                    <span className="text-sm font-extrabold">+254 793 625426</span>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:chibudangote1561@gmail.com"
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-[#0077ff]/5 border border-[#0077ff]/10 hover:border-[#0077ff]/30 text-[#0077ff] hover:bg-[#0077ff]/10 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#0077ff]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5.5 h-5.5 text-[#0077ff]" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email Address</span>
                    <span className="text-sm font-extrabold break-all">chibudangote1561@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 aspect-video lg:aspect-auto lg:flex-grow relative min-h-[220px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.9356606780625!2d36.7439285!3d-1.2336737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f19f6d0e88eef%3A0x7b3b6e0f5b5c5b0f!2sTatucity%20Unity%20Homes!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                className="absolute inset-0 w-full h-full border-0 opacity-70 hover:opacity-90 transition-opacity duration-300"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
