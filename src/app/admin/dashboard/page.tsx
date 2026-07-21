"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Home as HomeIcon, 
  Video as VideoIcon, 
  Camera as CameraIcon, 
  Calendar as CalendarIcon, 
  Award as AwardIcon, 
  BookOpen as BookOpenIcon, 
  Inbox as InboxIcon, 
  Bell as BellIcon, 
  Settings as SettingsIcon, 
  User as UserIcon,
  LogOut, 
  Dumbbell 
} from 'lucide-react';


import HomeEditor from '@/components/admin/HomeEditor';
import VideosEditor from '@/components/admin/VideosEditor';
import GalleryEditor from '@/components/admin/GalleryEditor';
import EventsEditor from '@/components/admin/EventsEditor';
import AchievementsEditor from '@/components/admin/AchievementsEditor';
import BlogEditor from '@/components/admin/BlogEditor';
import ContactEditor from '@/components/admin/ContactEditor';
import PopupsEditor from '@/components/admin/PopupsEditor';
import SettingsEditor from '@/components/admin/SettingsEditor';
import InstructorStatsEditor from '@/components/admin/InstructorStatsEditor';

const TABS = [
  { id: 'home', label: 'Home Content', icon: HomeIcon, component: HomeEditor },
  { id: 'videos', label: 'Videos', icon: VideoIcon, component: VideosEditor },
  { id: 'gallery', label: 'Gallery', icon: CameraIcon, component: GalleryEditor },
  { id: 'events', label: 'Events', icon: CalendarIcon, component: EventsEditor },
  { id: 'achievements', label: 'Achievements', icon: AwardIcon, component: AchievementsEditor },
  { id: 'blog', label: 'Blog Posts', icon: BookOpenIcon, component: BlogEditor },
  { id: 'contact', label: 'Contact Inquiries', icon: InboxIcon, component: ContactEditor },
  { id: 'popups', label: 'Daily Popups', icon: BellIcon, component: PopupsEditor },
  { id: 'instructor', label: 'Instructor & Stats', icon: UserIcon, component: InstructorStatsEditor },
  { id: 'settings', label: 'General Settings', icon: SettingsIcon, component: SettingsEditor },
];



export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!user) {
          router.replace('/admin/login');
          return;
        }
        setUserEmail(user.email ?? 'Admin User');
      } catch {
        if (isMounted) {
          router.replace('/admin/login');
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    checkUser();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    router.replace('/admin/login');
  };

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || HomeEditor;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#ff6b00]/30 border-t-[#ff6b00] animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Checking admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col lg:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full lg:w-72 bg-[#121214] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col shrink-0">
        {/* Logo header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b00] to-[#ff2a2a] flex items-center justify-center shadow-lg shadow-orange-500/10">
              <Dumbbell className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase">
              GymItUpWith <span className="text-[#ff6b00]">Admin</span>
            </span>
          </div>
        </div>

        {/* Tab List */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[50vh] lg:max-h-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#ff6b00] text-white shadow-lg shadow-orange-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col gap-3">
          <div className="px-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Logged in as</p>
            <p className="text-xs text-gray-300 font-medium truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-white hover:bg-rose-500/10 transition-colors border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content container */}
      <main className="flex-grow p-6 lg:p-10 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                {TABS.find(tab => tab.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Manage and update your website's content dynamically.
              </p>
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl border border-white/15 bg-gradient-to-br from-[#121214] to-[#0a0a0c] p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ActiveComponent />
          </div>
        </div>
      </main>
    </div>
  );
}
