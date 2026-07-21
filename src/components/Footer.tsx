import React from 'react';
import Link from 'next/link';
import { Dumbbell, Mail, Phone, MessageSquare } from 'lucide-react';
import { InstagramIcon, YouTubeIcon, TikTokIcon, XTwitterIcon } from './SocialIcons';

export default function Footer() {
  return (
    <footer className="bg-[#070709] border-t border-white/5 py-16 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ff6b00] to-[#ff2a2a] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <span className="font-extrabold text-lg tracking-wider text-white uppercase">
                GYMITUPWITH <span className="text-[#ff6b00]">Billy</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              Empowering individuals to achieve their fitness goals through professional personal training, customized weight loss programs, muscle gain guidance, and supportive gym culture.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.instagram.com/gymitupwith"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#ff6b00] hover:border-[#ff6b00]/30 hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Follow us on Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@gymitupwith"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#ff2a2a] hover:border-[#ff2a2a]/30 hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Follow us on YouTube"
              >
                <YouTubeIcon className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@gymitupwith"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Follow us on TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/gymitupwith"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Follow us on X"
              >
                <XTwitterIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Workouts & Tutorials
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Transformations
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Bootcamps & Challenges
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Fitness Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-[#ff6b00] shrink-0" />
                <span>+254 793 62542</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#0077ff] shrink-0" />
                <span className="break-all">info@gymitupwith.co.ke</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-400">
                <MessageSquare className="w-4 h-4 text-[#ff2a2a] shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Gymitupwith Billy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

