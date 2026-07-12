// scripts/transfer_gym_content.js
/**
 * Seeding script to upload media files from "gymitupwith content" directory
 * to Supabase Storage and register them in DB tables.
 */
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Helper to parse .env.local file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fsSync.existsSync(envPath)) {
    console.error('Error: .env.local file not found.');
    process.exit(1);
  }

  const content = fsSync.readFileSync(envPath, 'utf8');
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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Helper to format names into user-friendly titles
function formatTitle(fileName) {
  const base = path.basename(fileName, path.extname(fileName));
  // Replace underscores and dashes with spaces
  let title = base.replace(/[_-]/g, ' ');
  // Remove numbers
  title = title.replace(/\d+/g, '').trim();
  // Capitalize words
  title = title.split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return title || "Gym Training Session";
}

async function uploadFile(filePath, bucket) {
  const fileName = path.basename(filePath);
  const fileData = await fs.readFile(filePath);
  
  // Check if file already exists in bucket by checking list
  const { data: fileList, error: listError } = await supabase.storage.from(bucket).list('', {
    search: fileName,
  });

  if (!listError && fileList && fileList.some(f => f.name === fileName)) {
    console.log(`File already exists in storage: ${fileName}`);
    return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
  }

  let contentType = 'application/octet-stream';
  if (fileName.endsWith('.mp4')) contentType = 'video/mp4';
  else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) contentType = 'image/jpeg';
  else if (fileName.endsWith('.png')) contentType = 'image/png';
  else if (fileName.endsWith('.webp')) contentType = 'image/webp';

  const { data, error } = await supabase.storage.from(bucket).upload(fileName, fileData, {
    cacheControl: '3600',
    contentType,
    upsert: true,
  });
  if (error) {
    console.error(`Upload error for ${fileName}:`, error);
    throw error;
  }
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return urlData.publicUrl;
}

async function ensureBucket(bucketName) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  const exists = buckets.find(b => b.name === bucketName);
  if (!exists) {
    console.log(`Creating bucket "${bucketName}"...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
    });
    if (createError) {
      console.error(`Error creating bucket ${createError.message}`);
    }
  }
}

async function run() {
  console.log('Ensuring buckets exist...');
  await ensureBucket('gallery');
  await ensureBucket('videos');

  const contentDir = path.resolve(process.cwd(), 'gymitupwith content');
  let files;
  try {
    files = await fs.readdir(contentDir);
  } catch (err) {
    console.error(`Could not read directory ${contentDir}:`, err.message);
    process.exit(1);
  }

  console.log(`Found ${files.length} files in gymitupwith content. Starting upload...`);

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) continue;

    const ext = path.extname(file).toLowerCase();
    const title = formatTitle(file);

    try {
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        console.log(`Processing image: ${file} -> Title: ${title}`);
        const publicUrl = await uploadFile(filePath, 'gallery');
        
        // Insert into gallery table
        const { error: dbErr } = await supabase.from('gallery').insert({
          title,
          image_url: publicUrl,
          category: 'gym_sessions',
          status: 'active'
        });
        if (dbErr) {
          console.error(`DB error for ${file}:`, dbErr.message);
        } else {
          console.log(`Successfully migrated image ${file}`);
        }
      } else if (['.mp4'].includes(ext)) {
        console.log(`Processing video: ${file} -> Title: ${title}`);
        const publicUrl = await uploadFile(filePath, 'videos');

        // Insert into videos table
        const { error: dbErr } = await supabase.from('videos').insert({
          title,
          video_url: publicUrl,
          category: 'workout',
          is_featured: false,
          status: 'active'
        });
        if (dbErr) {
          console.error(`DB error for ${file}:`, dbErr.message);
        } else {
          console.log(`Successfully migrated video ${file}`);
        }
      } else {
        console.log(`Skipping unsupported extension: ${file}`);
      }
    } catch (err) {
      console.error(`Failed to migrate ${file}:`, err.message);
    }
  }

  console.log('Migration script finished!');
}

run();
