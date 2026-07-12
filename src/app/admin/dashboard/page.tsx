"use client";

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import HomeEditor from '@/components/admin/HomeEditor';
import CarouselEditor from '@/components/admin/CarouselEditor';
import VideosEditor from '@/components/admin/VideosEditor';
import GalleryEditor from '@/components/admin/GalleryEditor';
import EventsEditor from '@/components/admin/EventsEditor';
import AchievementsEditor from '@/components/admin/AchievementsEditor';
import BlogEditor from '@/components/admin/BlogEditor';
import ContactEditor from '@/components/admin/ContactEditor';
import PopupsEditor from '@/components/admin/PopupsEditor';
import ChatLinksEditor from '@/components/admin/ChatLinksEditor';
import SettingsEditor from '@/components/admin/SettingsEditor';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-surface-dark text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:grid-cols-10 gap-2 mb-4">
          <TabsTrigger value="home" className="px-3 py-2 rounded">Home</TabsTrigger>
          <TabsTrigger value="carousel" className="px-3 py-2 rounded">Carousel</TabsTrigger>
          <TabsTrigger value="videos" className="px-3 py-2 rounded">Videos</TabsTrigger>
          <TabsTrigger value="gallery" className="px-3 py-2 rounded">Gallery</TabsTrigger>
          <TabsTrigger value="events" className="px-3 py-2 rounded">Events</TabsTrigger>
          <TabsTrigger value="achievements" className="px-3 py-2 rounded">Achievements</TabsTrigger>
          <TabsTrigger value="blog" className="px-3 py-2 rounded">Blog</TabsTrigger>
          <TabsTrigger value="contact" className="px-3 py-2 rounded">Contact</TabsTrigger>
          <TabsTrigger value="popups" className="px-3 py-2 rounded">Popups</TabsTrigger>
          <TabsTrigger value="chat" className="px-3 py-2 rounded">Chat Links</TabsTrigger>
          <TabsTrigger value="settings" className="px-3 py-2 rounded">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="space-y-4"><HomeEditor /></TabsContent>
        <TabsContent value="carousel" className="space-y-4"><CarouselEditor /></TabsContent>
        <TabsContent value="videos" className="space-y-4"><VideosEditor /></TabsContent>
        <TabsContent value="gallery" className="space-y-4"><GalleryEditor /></TabsContent>
        <TabsContent value="events" className="space-y-4"><EventsEditor /></TabsContent>
        <TabsContent value="achievements" className="space-y-4"><AchievementsEditor /></TabsContent>
        <TabsContent value="blog" className="space-y-4"><BlogEditor /></TabsContent>
        <TabsContent value="contact" className="space-y-4"><ContactEditor /></TabsContent>
        <TabsContent value="popups" className="space-y-4"><PopupsEditor /></TabsContent>
        <TabsContent value="chat" className="space-y-4"><ChatLinksEditor /></TabsContent>
        <TabsContent value="settings" className="space-y-4"><SettingsEditor /></TabsContent>
      </Tabs>
    </div>
  );
}
