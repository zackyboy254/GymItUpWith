'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, BookOpen, Clock, User, ArrowRight, Dumbbell, X } from 'lucide-react';
import GymLoading from '@/components/GymLoading';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category: string;
  created_at: string;
}

const MOCK_POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Top 5 High-Protein Kenyan Foods for Muscle Growth',
    slug: 'kenyan-high-protein-foods',
    content: 'Building muscle in Kenya is highly affordable and delicious if you select local whole foods. (1) Ndengu (Mung Beans) - packed with plant protein and fiber. (2) Kamande (Lentils) - easy to digest and cost-effective. (3) Eggs - the gold standard of biological protein value. (4) Omena - high in omega-3 fatty acids and clean proteins. (5) Kienyeji Chicken - lean and rich in amino acids.',
    excerpt: 'Discover cost-effective, local Kenyan foods packed with high-quality protein to fuel muscle recovery and hypertrophy without breaking the bank.',
    cover_image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600',
    category: 'nutrition',
    created_at: '2026-06-10T08:00:00Z',
  },
  {
    id: 2,
    title: 'Mastering the Barbell Deadlift: Step-by-Step Form Guide',
    slug: 'mastering-barbell-deadlift',
    content: 'The deadlift is the king of posterior chain exercises. Proper setup is essential: Stand with mid-foot under the bar. Bend and grab the bar with a shoulder-width grip. Drop your shins to the bar, flatten your back, and pull. Focus on driving your feet into the floor instead of pulling with your lower back.',
    excerpt: 'Learn the proper technique, setup alignment, and back safety cues for the deadlift to safely build full-body strength and size.',
    cover_image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600',
    category: 'workout',
    created_at: '2026-06-15T09:30:00Z',
  },
  {
    id: 3,
    title: 'The Silent Killer of Gains: Why Sleep is More Important Than Cardio',
    slug: 'sleep-importance-for-gains',
    content: 'Many fitness enthusiasts train hard but ignore recovery. Sleep is when growth hormone is released, repair occurs, and mental fatigue is restored. Aim for 7-9 hours of quality sleep to optimize muscle gains and metabolic rate.',
    excerpt: 'Explore how sleep deprivation raises cortisol levels, stalls muscle synthesis, and hinders fat loss efforts.',
    cover_image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    category: 'wellness',
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 4,
    title: 'Hydration Hacks: Staying Energized During Intense Nairobi Workouts',
    slug: 'hydration-hacks-intense-workouts',
    content: 'Dehydration by just 2% can decrease muscular power by up to 15%. Drinking water consistently throughout the day is critical. For sessions exceeding one hour, add a pinch of sea salt and lemon to replace vital electrolytes.',
    excerpt: 'Stay hydrated! Discover the biological signs of dehydration and learn how to manage fluid intake for outdoor challenges and bootcamps.',
    cover_image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600',
    category: 'lifestyle',
    created_at: '2026-06-24T14:20:00Z',
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All Articles' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'workout', label: 'Workouts' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.warn('Failed to load blog posts from Supabase, using mock data:', err);
        setPosts(MOCK_POSTS);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts[0] || null;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Fixed Background Image */}
      <div
        className="fixed inset-0 z-0 select-none pointer-events-none opacity-5 dark:opacity-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/blog-bg.webp')" }}
      ></div>

      <div className="relative z-10 space-y-16 pt-10">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <span className="text-[#ff6b00] text-sm font-bold uppercase tracking-wider">Coach Insights</span>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white uppercase">Fitness & Nutrition Blog</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm">
            Get practical tips, customized nutrition advice, muscle-building guidelines, and lifestyle hacks to accelerate your transformation.
          </p>
        </div>

        {/* Blog Details Modal */}
        {selectedPost && (
          <div
            onClick={() => setSelectedPost(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto animate-in fade-in duration-300 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl rounded-2xl glass-panel p-6 lg:p-10 border border-white/10 bg-[#0d0d0f] space-y-6 max-h-[90vh] overflow-y-auto cursor-default"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/60 text-white font-bold hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${selectedPost.cover_image})` }}></div>
              </div>
              <div className="space-y-4">
                <span className="inline-block text-[10px] text-[#ff6b00] uppercase font-extrabold tracking-widest bg-[#ff6b00]/10 border border-[#ff6b00]/20 px-3 py-1 rounded-full">
                  {selectedPost.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                  {selectedPost.title}
                </h2>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 pb-4 border-b border-white/5">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    By Coach Billy
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line pt-2">
                  {selectedPost.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Featured Article Section */}
        {!loading && featuredPost && !search && selectedCategory === 'all' && (
          <section className="relative rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/10 p-6 lg:p-12 bg-white/50 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 relative aspect-video rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 bg-black">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${featuredPost.cover_image})` }}></div>
            </div>
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-xs text-[#ff6b00]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Featured Article</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight leading-snug">
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/5">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(featuredPost.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPost(featuredPost)}
                  className="inline-flex items-center text-xs font-bold text-[#ff6b00] hover:text-[#e05e00] transition-colors cursor-pointer"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search articles..."
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
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-black/10 dark:border-white/10 bg-white/50 dark:bg-gradient-to-br dark:from-[#121214] dark:to-[#0a0a0c]"
              >
                {/* Cover Image */}
                <div className="relative aspect-video bg-black overflow-hidden group">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.cover_image})` }}></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/45 transition-colors duration-300"></div>
                  <span className="absolute bottom-3 right-3 text-[9px] bg-black/60 backdrop-blur-sm text-gray-300 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border border-white/5">
                    {post.category}
                  </span>
                </div>
                {/* Info */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug hover:text-[#ff6b00] transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-black/10 dark:border-white/5">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="inline-flex items-center font-bold text-[#ff6b00] hover:text-[#e05e00] transition-colors cursor-pointer"
                    >
                      Read
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-2xl animate-in fade-in duration-300">
            <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-bounce" />
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">No articles found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
