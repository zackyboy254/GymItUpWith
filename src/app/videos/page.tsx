'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Play, Dumbbell, Calendar, Info } from 'lucide-react';
import GymLoading from '@/components/GymLoading';

interface Video {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  category: string;
  is_featured: boolean;
  created_at: string;
}

const VIDEO_THUMBNAIL_FALLBACKS = [
  '/images/gym1.jpg',
  '/images/gym2.jpg',
  '/images/gym3.jpg',
  '/images/gym4.jpg',
  '/images/gym5.jpg',
  '/images/gym6.jpg',
];

const hashStringToIndex = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % VIDEO_THUMBNAIL_FALLBACKS.length;
};

const getVideoThumbnail = (video: Video) => {
  if (video.thumbnail_url) return video.thumbnail_url;

  const youtubeIdMatch = video.video_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (youtubeIdMatch?.[1]) {
    return `https://img.youtube.com/vi/${youtubeIdMatch[1]}/hqdefault.jpg`;
  }

  return VIDEO_THUMBNAIL_FALLBACKS[hashStringToIndex(video.video_url || String(video.id))];
};

const MOCK_VIDEOS: Video[] = [
  {
    id: 1,
    title: 'Leg Day Squats Form Tutorial - Avoid Back Pain',
    video_url: 'https://www.youtube.com/embed/gcNh17CklRI',
    thumbnail_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600',
    category: 'tutorial',
    is_featured: true,
    created_at: '2026-01-10T12:00:00Z',
  },
  {
    id: 2,
    title: 'High Intensity HIIT Workout - Shred Fat Fast',
    video_url: 'https://www.youtube.com/embed/ml6cT4AZdqI',
    thumbnail_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    category: 'workout',
    is_featured: false,
    created_at: '2026-02-15T12:00:00Z',
  },
  {
    id: 3,
    title: 'Client Transformation Story: 3 Months of Consistency',
    video_url: 'https://www.youtube.com/embed/y8y1N-9D09Y',
    thumbnail_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600',
    category: 'transformation',
    is_featured: false,
    created_at: '2026-03-20T12:00:00Z',
  },
  {
    id: 4,
    title: 'Nairobi Outdoor Bootcamp - Join the Team',
    video_url: 'https://www.youtube.com/embed/g2qX771m_bI',
    thumbnail_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600',
    category: 'event',
    is_featured: false,
    created_at: '2026-04-05T12:00:00Z',
  },
  {
    id: 5,
    title: 'Dumbbell-Only Upper Body Workout (Home & Gym)',
    video_url: 'https://www.youtube.com/embed/gcNh17CklRI',
    thumbnail_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600',
    category: 'workout',
    is_featured: false,
    created_at: '2026-05-18T12:00:00Z',
  },
  {
    id: 6,
    title: 'Deadlift Setup Masterclass - Full Walkthrough',
    video_url: 'https://www.youtube.com/embed/r4MzxtB1FTo',
    thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
    category: 'tutorial',
    is_featured: false,
    created_at: '2026-06-01T12:00:00Z',
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All Videos' },
  { value: 'workout', label: 'Workouts' },
  { value: 'tutorial', label: 'Tutorials' },
  { value: 'transformation', label: 'Transformations' },
  { value: 'event', label: 'Events' },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setVideos(data);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.warn('Failed to load videos from Supabase, using mock data:', err);
        setVideos(MOCK_VIDEOS);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  // Filtered lists
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Featured video
  const featuredVideo = videos.find((v) => v.is_featured) || videos[0];

  const handlePlayVideo = (url: string, title: string) => {
    // Convert normal youtube links to embed if needed
    let embedUrl = url;
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    setActiveVideoUrl(embedUrl);
    setActiveVideoTitle(title);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Loop Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-5 dark:opacity-10 min-h-[100vh]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover fixed inset-0"
        >
          <source src="https://bqgcorqknezxigssfdaz.supabase.co/storage/v1/object/public/videos/gymitupwith_1726006159_3454311198011639392_68983693767.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f8fa] via-[#f7f8fa]/80 to-[#f7f8fa] dark:from-[#0a0a0c] dark:via-[#0a0a0c]/85 dark:to-[#0a0a0c]"></div>
      </div>

      <div className="relative z-10 space-y-16 pt-10">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <span className="text-[#ff6b00] text-sm font-bold uppercase tracking-wider">Video Hub</span>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white uppercase">Workout Videos & Tutorials</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm">
            Browse through workout playlists, structural anatomy lessons, client highlights, and tips directly from Coach Billy.
          </p>
        </div>

        {/* Video Player Modal */}
        {activeVideoUrl && (
          <div
            onClick={() => {
              setActiveVideoUrl(null);
              setActiveVideoTitle('');
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden glass-panel cursor-default"
            >
              <button
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveVideoTitle('');
                }}
                className="absolute top-4 right-4 z-10 px-4 py-2 rounded-xl bg-black/60 text-white font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Close Player
              </button>
              {activeVideoUrl.endsWith('.mp4') || activeVideoUrl.includes('supabase') ? (
                <video
                  src={activeVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  src={activeVideoUrl}
                  title={activeVideoTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        )}

        {/* Featured Video Section */}
        {!loading && featuredVideo && !search && selectedCategory === 'all' && (
          <section className="relative rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 p-6 lg:p-12 bg-white/40 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden group border border-black/5 dark:border-white/5 bg-black">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getVideoThumbnail(featuredVideo)})` }}></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                <button
                  onClick={() => handlePlayVideo(featuredVideo.video_url, featuredVideo.title)}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff6b00] to-[#ff2a2a] flex items-center justify-center text-white shadow-xl shadow-orange-500/30 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                  aria-label={`Play featured video: ${featuredVideo.title}`}
                >
                  <Play className="w-8 h-8 fill-white ml-1" />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-xs text-[#ff6b00]">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Featured Workout</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
                {featuredVideo.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Master the execution dynamics of our main exercises. Coach Billy breaks down alignment, posture guidelines, muscle target focus, and safety cues.
              </p>
              <div className="flex items-center space-x-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(featuredVideo.created_at).toLocaleDateString()}
                </span>
                <span className="uppercase tracking-widest text-[#0077ff] font-bold">
                  {featuredVideo.category}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80 text-gray-900 dark:text-white">
            <input
              type="text"
              placeholder="Search workouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
            <Search className="absolute left-4.5 top-3.5 w-4 h-4 text-gray-500" />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${selectedCategory === cat.value
                  ? 'bg-[#ff6b00] text-white'
                  : 'bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <GymLoading size="medium" />
        ) : filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-black/10 dark:border-white/10 bg-white/40 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c]"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black overflow-hidden group">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getVideoThumbnail(video)})` }}></div>
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handlePlayVideo(video.video_url, video.title)}
                      className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff6b00] to-[#ff2a2a] flex items-center justify-center text-white opacity-90 group-hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                      aria-label={`Play video: ${video.title}`}
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-3 right-3 text-[10px] bg-black/60 backdrop-blur-sm text-gray-300 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border border-white/5">
                    {video.category}
                  </span>
                </div>
                {/* Info */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug hover:text-[#ff6b00] transition-colors duration-200">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-black/10 dark:border-white/5">
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 cursor-help" title={`Category: ${video.category}`}>
                      <Info className="w-3.5 h-3.5" />
                      Info
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-2xl animate-in fade-in duration-300">
            <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-bounce" />
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">No videos found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
