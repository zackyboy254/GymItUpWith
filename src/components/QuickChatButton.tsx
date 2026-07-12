// src/components/QuickChatButton.tsx
"use client";

import { useState } from 'react';
import { MessageSquare, Phone, MessageCircle, X, ChevronUp } from 'lucide-react';

export default function QuickChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = '+254 793 62542';
  const phoneNumber = '+254 793 62542';

  const toggleChatbot = () => {
    window.dispatchEvent(new CustomEvent('toggle-gym-chatbot'));
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3.5 z-45">
      {/* Expanded sub-buttons */}
      <div className={`flex flex-col space-y-3 transition-all duration-300 transform origin-bottom ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
        }`}>
        {/* Chatbot Button */}
        <button
          onClick={toggleChatbot}
          className="flex items-center space-x-2 bg-white dark:bg-[#1a1a1f] border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-[#ff6b00] group cursor-pointer"
          title="Open Assistant"
        >
          <MessageSquare className="w-4 h-4 text-[#ff6b00] group-hover:rotate-6 transition-transform" />
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Coach Bot</span>
        </button>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hello%20Coach%20Billy%2C%20I%20want%20to%20learn%20more%20about%20your%20coaching%20programs!`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-white dark:bg-[#1a1a1f] border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-emerald-500 group cursor-pointer"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">WhatsApp</span>
        </a>

        {/* Phone Button */}
        <a
          href={`tel:${phoneNumber}`}
          className="flex items-center space-x-2 bg-white dark:bg-[#1a1a1f] border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-[#0077ff] group cursor-pointer"
          title="Call Coach"
        >
          <Phone className="w-4 h-4 text-[#0077ff] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Call Coach</span>
        </a>
      </div>

      {/* Main floating action button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ff6b00] to-[#ff2a2a] flex items-center justify-center text-white shadow-xl shadow-orange-600/30 hover:scale-110 active:scale-95 hover:shadow-orange-600/40 transition-all duration-300 group cursor-pointer"
        aria-label="Toggle contact quick actions"
      >
        {isOpen ? (
          <X className="w-6 h-6 rotate-90 transition-transform duration-300" />
        ) : (
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform duration-300" />
        )}
      </button>
    </div>
  );
}
