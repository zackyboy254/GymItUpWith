/**
 * Upload gym images from "gym img" folder to Supabase Storage
 * Run: node scripts/upload_gym_images.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'gym-images';
const IMG_DIR = path.join(__dirname, '..', 'gym img');

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets && buckets.find(b => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) {
      console.error('Failed to create bucket:', error.message);
      process.exit(1);
    }
    console.log(`✅ Bucket "${BUCKET}" created.`);
  } else {
    console.log(`ℹ️  Bucket "${BUCKET}" already exists.`);
  }
}

async function uploadImages() {
  await ensureBucket();

  const files = fs.readdirSync(IMG_DIR).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
  if (files.length === 0) {
    console.log('No image files found in "gym img" folder.');
    return [];
  }

  const uploadedUrls = [];

  for (const file of files) {
    const filePath = path.join(IMG_DIR, file);
    const fileContent = fs.readFileSync(filePath);
    // sanitize filename: replace spaces, parentheses with underscores
    const sanitized = file.replace(/[\s()]/g, '_').toLowerCase();
    const storagePath = `hero/${sanitized}`;

    const ext = path.extname(file).toLowerCase().slice(1);
    const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
    const contentType = mimeMap[ext] || 'image/jpeg';

    console.log(`Uploading: ${file} → ${storagePath}`);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileContent, { contentType, upsert: true });

    if (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    } else {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      console.log(`  ✅ ${publicUrl}`);
      uploadedUrls.push({ file, sanitized, url: publicUrl });
    }
  }

  console.log('\n=== All uploaded URLs ===');
  uploadedUrls.forEach(u => console.log(`"${u.url}",`));
  console.log('\nCopy the above URLs into page.tsx CAROUSEL_IMAGES array.');
  return uploadedUrls;
}

uploadImages().catch(console.error);
