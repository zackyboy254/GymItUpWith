'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useJoinModal } from '@/context/JoinModalContext';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { PROGRAM_OPTIONS } from '@/lib/programs';

export default function JoinModal() {
  const { isOpen, selectedProgram, closeModal } = useJoinModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    preferredDate: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside of modal container
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, program: selectedProgram }));
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, selectedProgram]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.program || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields. ⚠️');
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit your request.');

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', program: '', preferredDate: '', message: '' });
      // Close modal after short success display delay
      setTimeout(() => {
        closeModal();
        setStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Modal registration submission error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unable to submit your request. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md transition-opacity duration-300 popup-backdrop"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="pointer-events-auto w-full max-w-lg rounded-3xl overflow-hidden glass-panel border border-[#ff6b00]/30 bg-gradient-to-br from-[#121214] via-[#0d0d0f] to-[#0a0a0c] shadow-2xl p-6 lg:p-8 space-y-6 popup-card max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">
                Join Program ⚡
              </h2>
              <p className="text-xs text-gray-400">
                Choose your next chapter with Grow Fit.
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerts */}
          {status === 'success' && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Message Sent Successfully! 🎉</h4>
                <p className="text-xs text-emerald-500/80 mt-1">Thank you. Coach Billy will respond to your email or phone number shortly.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Submission Error</h4>
                <p className="text-xs text-rose-500/80 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="modal-name" className="block font-bold text-gray-400 uppercase tracking-wider">
                  Full Name <span className="text-[#ff2a2a]">*</span>
                </label>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6b00]"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="modal-phone" className="block font-bold text-gray-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="modal-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +254 793 62542"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6b00]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-program" className="block font-bold text-gray-400 uppercase tracking-wider">
                Program / Activity <span className="text-[#FC6129]">*</span>
              </label>
              <select id="modal-program" name="program" value={formData.program} onChange={handleChange} required className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FC6129]">
                <option value="" disabled>Select a program or activity</option>
                {PROGRAM_OPTIONS.map((program) => <option key={program} value={program} className="bg-[#121214]">{program}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-date" className="block font-bold text-gray-400 uppercase tracking-wider">
                Preferred Date <span className="text-gray-500 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input type="date" id="modal-date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FC6129]" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-email" className="block font-bold text-gray-400 uppercase tracking-wider">
                Email Address <span className="text-[#ff2a2a]">*</span>
              </label>
              <input
                type="email"
                id="modal-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. johndoe@gmail.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6b00]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-message" className="block font-bold text-gray-400 uppercase tracking-wider">
                Your Fitness Goals <span className="text-[#ff2a2a]">*</span>
              </label>
              <textarea
                id="modal-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell Coach Billy about your targets (e.g., lose 5kg, build lean muscle, personal training details)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6b00] resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting' || status === 'success'}
              className="w-full inline-flex items-center justify-center px-6 py-3.5 font-bold text-white bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] hover:from-[#ff2a2a] hover:to-[#ff6b00] rounded-xl shadow-lg shadow-orange-500/15 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:bg-white/5 disabled:text-gray-500"
            >
              {status === 'submitting' ? (
                'Submitting Request...'
              ) : status === 'success' ? (
                'Submitted! 🎉'
              ) : (
                <>
                  Submit Join Request
                  <Send className="w-4.5 h-4.5 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
