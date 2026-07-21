const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to parse .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found.');
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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or Service Role Key missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  console.log('🔄 Starting video synchronization...');

  try {
    // 1. List all files in 'videos' storage bucket
    console.log('Listing files in storage bucket "videos"...');
    const { data: files, error: listError } = await supabase.storage.from('videos').list('', { limit: 1000 });
    if (listError) throw listError;
    
    if (!files || files.length === 0) {
      console.log('No files found in "videos" storage bucket.');
      return;
    }
    console.log(`Found ${files.length} files in storage.`);

    // 2. Fetch existing video records from DB
    console.log('Fetching existing video records from database...');
    const { data: dbVideos, error: dbError } = await supabase.from('videos').select('video_url');
    if (dbError) throw dbError;

    const existingUrls = new Set(dbVideos.map(v => v.video_url));
    console.log(`Found ${existingUrls.size} existing videos in database.`);

    // 3. Filter files that are not in DB and build payload
    const newRecords = [];
    
    // Sort files by created_at ascending so we insert them in chronological order
    files.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let index = 1;
    for (const file of files) {
      // Skip directories or placeholder files
      if (file.name === '.emptyFolderPlaceholder' || !file.metadata || file.metadata.size === 0) {
        continue;
      }

      // Generate public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/videos/${encodeURIComponent(file.name)}`;
      
      if (!existingUrls.has(publicUrl)) {
        // Try to parse timestamp from filename: gymitupwith_1766533009_...
        let dateStr = new Date(file.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        // Determine title
        const title = `Workout Video - ${dateStr} (#${index})`;

        newRecords.push({
          title: title,
          video_url: publicUrl,
          category: 'workout',
          is_featured: false,
          status: 'active',
          sort_order: index,
          created_at: file.created_at
        });
        index++;
      }
    }

    if (newRecords.length === 0) {
      console.log('✅ Database is already in sync with storage. No new videos to insert.');
      return;
    }

    console.log(`Inserting ${newRecords.length} new video records into database...`);
    
    // Insert in batches of 50 to avoid any limits
    const batchSize = 50;
    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);
      const { error: insertError } = await supabase.from('videos').insert(batch);
      if (insertError) {
        console.error(`Error inserting batch starting at index ${i}:`, insertError);
        throw insertError;
      }
      console.log(`Inserted batch ${i / batchSize + 1}...`);
    }

    console.log(`🎉 Successfully synchronized ${newRecords.length} videos to the database!`);
  } catch (err) {
    console.error('Fatal synchronization error:', err);
  }
}

sync();
