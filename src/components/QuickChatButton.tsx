// src/components/QuickChatButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Phone, MessageCircle, X, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ChatLink {
  id: number;
  type: 'chatbot' | 'whatsapp' | 'phone';
  url: string;
  order: number;
  status: 'active' | 'disabled';
}

const DEFAULT_CHAT_LINKS: ChatLink[] = [
  { id: 1, type: 'chatbot', url: '', order: 1, status: 'active' },
  { id: 2, type: 'phone', url: '++254 793 62542', order: 2, status: 'active' },
  { id: 3, type: 'whatsapp', url: 'https://wa.me/+254 793 62542', order: 3, status: 'active' },
];

export default function QuickChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<ChatLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleChatbot = () => {
    window.dispatchEvent(new CustomEvent('toggle-gym-chatbot'));
    setIsOpen(false);
  };

  useEffect(() => {
    async function loadLinks() {
      try {
        const { data, error } = await supabase
          .from('chat_links')
          .select('*')
          .eq('status', 'active')
          .order('order', { ascending: true });

        if (error) {
          console.warn('Unable to load chat links:', error);
          setLinks(DEFAULT_CHAT_LINKS);
          return;
        }

        if (data && data.length > 0) {
          setLinks(data.map((link: any) => ({
            ...link,
            status: link.status ?? 'active',
          })));
        } else {
          setLinks(DEFAULT_CHAT_LINKS);
        }
      } catch (err) {
        console.warn('Error fetching chat links:', err);
        setLinks(DEFAULT_CHAT_LINKS);
      } finally {
        setIsLoading(false);
      }
    }

    loadLinks();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3.5 z-50">
      {/* Expanded sub-buttons */}
      <div className={`flex flex-col space-y-3 transition-all duration-300 transform origin-bottom ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
        }`}>
        {isLoading ? (
          <div className="flex items-center justify-center p-3 rounded-full bg-white/10 border border-white/10 text-xs text-gray-400">Loading chat links...</div>
        ) : links.length > 0 ? (
          links.map((link) => {
            const label = link.type === 'chatbot'
              ? 'Coach Bot'
              : link.type === 'whatsapp'
                ? 'WhatsApp'
                : 'Call Coach';
            const icon = link.type === 'chatbot' ? (
              <MessageSquare className="w-4 h-4 text-[#ff6b00] group-hover:rotate-6 transition-transform" />
            ) : link.type === 'whatsapp' ? (
              <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            ) : (
              <Phone className="w-4 h-4 text-[#0077ff] group-hover:scale-110 transition-transform" />
            );

            if (link.type === 'chatbot') {
              return (
                <button
                  key={link.id}
                  onClick={toggleChatbot}
                  className="flex items-center space-x-2 bg-white dark:bg-[#1a1a1f] border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-[#ff6b00] group cursor-pointer"
                  title="Open Assistant"
                >
                  {icon}
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{label}</span>
                </button>
              );
            }

            const href = link.type === 'phone' && !/^tel:/i.test(link.url)
              ? `tel:${link.url.replace(/\s+/g, '')}`
              : link.url;

            return (
              <a
                key={link.id}
                href={href}
                target={link.type === 'whatsapp' ? '_blank' : '_self'}
                rel={link.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
                className="flex items-center space-x-2 bg-white dark:bg-[#1a1a1f] border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-gray-900 dark:text-gray-100 group cursor-pointer"
                title={label}
              >
                {icon}
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{label}</span>
              </a>
            );
          })
        ) : (
          <div className="flex items-center justify-center p-3 rounded-full bg-white/10 border border-white/10 text-xs text-gray-400">No chat links available</div>
        )}
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
