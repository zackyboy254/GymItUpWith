/**
 * Supabase Seeding Script for Gym It Up With
 * Run this script to populate your database with initial fitness content.
 * 
 * Usage:
 *   node seed_supabase.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to parse .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found. Please copy your credentials first.');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] ? match[2].trim() : '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[match[1]] = val;
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key to bypass RLS for seeding, fallback to anon key if not provided
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('your-supabase-project-id')) {
  console.log('Skipping seed: Real Supabase URL is not configured in .env.local yet.');
  process.exit(0);
}

if (supabaseKey === env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Warning: Using ANON key for seeding. If Row Level Security (RLS) is enabled, this will fail. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_DATA = {
  quotes: [
    { text: "Consistency beats intensity. Show up for yourself daily.", author: "Coach Billy", status: "active" },
    { text: "The only bad workout is the one that didn't happen.", author: "Coach Billy", status: "active" },
    { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Coach Billy", status: "active" },
    { text: "Habari gani! Leo ni siku ya kuvunja jasho. Twende kazi!", author: "Coach Billy", status: "active" }
  ],
  daily_popups: [
    {
      title: "Never Miss a Monday! ⚡",
      message: "Start your week strong. Set your goals, plan your workouts, and let's make progress happen today!",
      cta_text: "Join Program",
      cta_link: "/contact",
      image_url: "/images/hero-bg.webp",
      popup_type: "motivation",
      day_of_week: "Monday",
      status: "active"
    },
    {
      title: "Today's Rule of Hydration 💧",
      message: "Drink at least 3 liters of water today. Nairobi heat or cold, muscle recovery starts with proper hydration.",
      cta_text: "Read Nutrition Blog",
      cta_link: "/blog",
      image_url: null,
      popup_type: "tip",
      day_of_week: "Tuesday",
      status: "active"
    },
    {
      title: "Mid-Week Progress Check! 📈",
      message: "You are halfway through the week! Don't slow down now. Consistency beats intensity every single time.",
      cta_text: "View Workouts",
      cta_link: "/videos",
      image_url: "/images/about-bg.webp",
      popup_type: "motivation",
      day_of_week: "Wednesday",
      status: "active"
    },
    {
      title: "Form Beats Weight! 🏋️‍♂️",
      message: "Focus on perfect execution rather than heavy weight to avoid injury and target the right muscle groups.",
      cta_text: "Watch Form Tutorials",
      cta_link: "/videos",
      image_url: null,
      popup_type: "tip",
      day_of_week: "Thursday",
      status: "active"
    },
    {
      title: "Nairobi outdoor Bootcamp! 📅",
      message: "Get ready for our weekend outdoor bootcamp! Join us for a fun, high-energy group session this Saturday.",
      cta_text: "Register Now",
      cta_link: "/events",
      image_url: "/images/events-bg.webp",
      popup_type: "event",
      day_of_week: "Friday",
      status: "active"
    },
    {
      title: "Weekend Warrior Mode! 🏆",
      message: "No excuses on the weekend! Grab a friend, hit the gym, and earn your rest day.",
      cta_text: "View Gallery",
      cta_link: "/gallery",
      image_url: "/images/gallery-bg.webp",
      popup_type: "promo",
      day_of_week: "Saturday",
      status: "active"
    },
    {
      title: "Active Recovery Sunday 🧠",
      message: "Rest, stretch, hydrate, and prepare your body and mind for the upcoming week. Recovery is where growth happens.",
      cta_text: "Contact Coach",
      cta_link: "/contact",
      image_url: null,
      popup_type: "tip",
      day_of_week: "Sunday",
      status: "active"
    }
  ],
  gallery: [
    { title: "Client Weight Loss Transformation", image_url: "/images/hero-bg.webp", category: "transformations", status: "active" },
    { title: "Nairobi Gym Core Session", image_url: "/images/about-bg.webp", category: "gym_sessions", status: "active" },
    { title: "East Africa Fitness Championship", image_url: "/images/gallery-bg.webp", category: "competitions", status: "active" }
  ],
  videos: [
    {
      title: "How to squat with perfect form (Nairobi Gym Session)",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail_url: "/images/hero-bg.webp",
      category: "tutorial",
      is_featured: true,
      status: "active"
    },
    {
      title: "Insane 15-Minute HIIT Workout - No Equipment",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail_url: "/images/about-bg.webp",
      category: "workout",
      is_featured: false,
      status: "active"
    }
  ],
  blogs: [
    {
      title: "Top 5 High-Protein Kenyan Foods for Muscle Growth",
      slug: "kenyan-high-protein-foods",
      excerpt: "Discover cost-effective, local Kenyan foods packed with high-quality protein to fuel muscle recovery and hypertrophy.",
      content: "Building muscle in Kenya is affordable and delicious if you select local whole foods such as Ndengu, Kamande, Eggs, Omena, and Kienyeji Chicken.",
      cover_image: "/images/hero-bg.webp",
      category: "nutrition",
      status: "active"
    },
    {
      title: "Mastering the Barbell Deadlift: Step-by-Step",
      slug: "mastering-barbell-deadlift",
      excerpt: "Learn the proper technique, setup alignment, and back safety cues for the deadlift to safely build full-body strength.",
      content: "The deadlift is the king of posterior chain exercises. Proper setup is essential: stand with mid-foot under the bar, flatten your back, and drive through the heels.",
      cover_image: "/images/about-bg.webp",
      category: "workout",
      status: "active"
    },
    {
      title: "Hydration Hacks: Staying Energized During Intense Nairobi Workouts",
      slug: "hydration-hacks-intense-workouts",
      excerpt: "Stay hydrated! Practical tips to manage fluid intake for outdoor sessions and bootcamps.",
      content: "Dehydration by just 2% can decrease muscular power by up to 15%. Drink consistently and consider electrolytes for sessions over one hour.",
      cover_image: "/images/gallery-bg.webp",
      category: "wellness",
      status: "active"
    }
  ],
  events: [
    {
      title: "Nairobi Power Bootcamp 2026",
      description: "Join us for an intense 2-hour outdoor boot camp featuring strength challenges, endurance drills, and healthy smoothies afterward.",
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Karura Forest, Nairobi",
      cover_image: "/images/events-bg.webp",
      registration_link: "https://wa.me/+254 793 62542?text=Hi%20Coach,%20I%20want%20to%20register%20for%20the%20Nairobi%20Power%20Bootcamp",
      status: "active"
    }
  ],
  achievements: [
    {
      title: "Kettlebell Master Certification",
      description: "Certified Kettlebell Instructor from the International Fitness Association (IFA).",
      image_url: "/images/logo.webp",
      achievement_date: "2025-10-15",
      status: "active"
    }
  ],
  programs: [
    {
      title: "Weight Loss Program",
      slug: "weight-loss",
      description: "A practical, coach-led plan for sustainable fat loss, better energy, and confidence that lasts.",
      duration: "12 weeks",
      difficulty: "All levels",
      featured: true,
      display_order: 1,
      status: "active"
    },
    {
      title: "90-Day Transformation",
      slug: "90-day-challenge",
      description: "A focused reset with training, nutrition, check-ins, and a community that keeps you moving.",
      duration: "90 days",
      difficulty: "Intermediate",
      featured: true,
      display_order: 2,
      status: "active"
    },
    {
      title: "Push-Up Challenge",
      slug: "push-up-challenge",
      description: "Build pressing strength and a habit of showing up with a progressive daily target.",
      duration: "30 days",
      difficulty: "Beginner",
      display_order: 3,
      status: "active"
    },
    {
      title: "Pull-Up Challenge",
      slug: "pull-up-challenge",
      description: "Develop your back and grip with accessible progressions from first rep to clean sets.",
      duration: "6 weeks",
      difficulty: "Intermediate",
      display_order: 4,
      status: "active"
    },
    {
      title: "Core & Abs Challenge",
      slug: "core-abs-challenge",
      description: "Train a strong, stable center with short sessions designed to fit real life.",
      duration: "21 days",
      difficulty: "All levels",
      display_order: 5,
      status: "active"
    },
    {
      title: "Squat Challenge",
      slug: "squat-challenge",
      description: "Move better, build lower-body strength, and make consistency your superpower.",
      duration: "30 days",
      difficulty: "Beginner",
      display_order: 6,
      status: "active"
    }
  ]
};

async function seed() {
  console.log('Starting database seeding...');

  try {
    // 1. Seed quotes
    console.log('Seeding quotes...');
    await supabase.from('quotes').delete().neq('id', 0);
    const { error: qErr } = await supabase.from('quotes').insert(SEED_DATA.quotes);
    if (qErr) console.warn('Quotes seeding issue:', qErr.message);

    // 2. Seed daily popups
    console.log('Seeding daily popups...');
    await supabase.from('daily_popups').delete().neq('id', 0);
    const { error: pErr } = await supabase.from('daily_popups').insert(SEED_DATA.daily_popups);
    if (pErr) console.warn('Daily popups seeding issue:', pErr.message);

    // 3. Seed gallery
    console.log('Seeding gallery...');
    await supabase.from('gallery').delete().neq('id', 0);
    const { error: gErr } = await supabase.from('gallery').insert(SEED_DATA.gallery);
    if (gErr) console.warn('Gallery seeding issue:', gErr.message);

    // 4. Seed videos
    console.log('Seeding videos...');
    await supabase.from('videos').delete().neq('id', 0);
    const { error: vErr } = await supabase.from('videos').insert(SEED_DATA.videos);
    if (vErr) console.warn('Videos seeding issue:', vErr.message);

    // 5. Seed blogs
    console.log('Seeding blogs...');
    await supabase.from('blogs').delete().neq('id', 0);
    const { error: bErr } = await supabase.from('blogs').insert(SEED_DATA.blogs);
    if (bErr) console.warn('Blogs seeding issue:', bErr.message);

    // 5. Seed events
    console.log('Seeding events...');
    await supabase.from('events').delete().neq('id', 0);
    const { error: eErr } = await supabase.from('events').insert(SEED_DATA.events);
    if (eErr) console.warn('Events seeding issue:', eErr.message);

    // 6. Seed achievements
    console.log('Seeding achievements...');
    await supabase.from('achievements').delete().neq('id', 0);
    const { error: aErr } = await supabase.from('achievements').insert(SEED_DATA.achievements);
    if (aErr) console.warn('Achievements seeding issue:', aErr.message);

    // 7. Seed programs
    console.log('Seeding programs...');
    await supabase.from('programs').delete().neq('id', 0);
    const { error: programErr } = await supabase.from('programs').insert(SEED_DATA.programs);
    if (programErr) console.warn('Programs seeding issue:', programErr.message);

    console.log('🎉 Seeding successfully completed!');
  } catch (err) {
    console.error('Fatal seeding error:', err);
  }
}

seed();
