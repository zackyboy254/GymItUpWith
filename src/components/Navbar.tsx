'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useJoinModal } from '@/context/JoinModalContext';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Videos', href: '/videos' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Events', href: '/events' },
  { name: 'Achievements', href: '/achievements' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { openModal } = useJoinModal();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/80 dark:bg-[#0a0a0c]/85 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-4'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <img
                src="/images/logo.webp"
                alt="Gymitupwith Billy Logo"
                className="w-10 h-10 rounded-xl border border-white/10 object-cover shadow-lg shadow-orange-500/15 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-extrabold text-lg tracking-wider text-black dark:text-white uppercase">
                GYMITUPWITH <span className="text-[#ff6b00]">Billy</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isActive(link.href)
                    ? 'text-[#ff6b00] bg-orange-500/5'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={openModal}
                className="relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden font-bold text-white transition duration-300 ease-out rounded-xl shadow-md bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] hover:from-[#ff2a2a] hover:to-[#ff6b00] hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#0077ff] to-[#00e5ff] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10 font-semibold tracking-wide">Join Program ⚡</span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-sm bg-white dark:bg-[#0d0d0f] border-l border-black/10 dark:border-white/10 p-6 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="font-extrabold text-lg tracking-wider text-black dark:text-white uppercase">
            GYMITUPWITH <span className="text-[#ff6b00]">Billy</span>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isActive(link.href)
                ? 'text-[#ff6b00] bg-orange-500/5'
                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-black/10 dark:border-white/5">
            <button
              onClick={() => {
                setIsOpen(false);
                openModal();
              }}
              className="w-full inline-flex items-center justify-center px-5 py-3.5 font-bold text-white rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] text-center shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              Join Program ⚡
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
