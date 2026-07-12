const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?/);
    if (match) {
      let val = (match[2] || '').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1]] = val;
    }
  });
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const TABLES = [
  'profiles',
  'quotes',
  'gallery',
  'videos',
  'blogs',
  'events',
  'achievements',
  'contact_requests',
  'daily_popups',
  'home_content',
  'carousel_slides',
  'settings',
  'chat_links'
];

async function checkAll() {
  for (const table of TABLES) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}' error: ${error.message} (${error.code})`);
    } else {
      console.log(`✅ Table '${table}' exists!`);
    }
  }
}

checkAll();
