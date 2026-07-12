// scripts/migrate_media.js
/**
 * Migration script to upload local media files from public/content to Supabase Storage
 * and insert corresponding records into database tables.
 */
const path = require('path');
const fs = require('fs').promises;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function uploadFile(filePath, bucket) {
  const fileName = path.basename(filePath);
  const fileData = await fs.readFile(filePath);
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, fileData, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return data.path;
}

async function migrate() {
  const contentDir = path.resolve(process.cwd(), 'public', 'content');
  const entries = await fs.readdir(contentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(contentDir, entry.name);
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      let bucket = '';
      let table = '';
      if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
        bucket = 'images';
        table = 'gallery_images'; // assume generic gallery table
      } else if (['.mp4', '.webm', '.mov'].includes(ext)) {
        bucket = 'videos';
        table = 'videos';
      } else {
        console.log(`Skipping unsupported file type: ${entry.name}`);
        continue;
      }
      console.log(`Uploading ${entry.name} to ${bucket}...`);
      const storagePath = await uploadFile(fullPath, bucket);
      // Insert record into appropriate table (simplified example)
      const payload = bucket === 'images'
        ? { url: storagePath, title: entry.name }
        : { url: storagePath, title: entry.name };
      const { error: insertError } = await supabase.from(table).insert(payload);
      if (insertError) throw insertError;
      // Remove local file after successful upload
      await fs.unlink(fullPath);
      console.log(`Migrated ${entry.name}`);
    }
  }
  console.log('Media migration completed');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
