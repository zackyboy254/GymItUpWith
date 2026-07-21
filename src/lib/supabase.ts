import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const authConfig = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
};

function assertEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`${name} is required. Please add it to your .env.local file.`);
  }
  return value;
}

// Client-side vs Server-side client for public queries
let supabaseInstance: any = null;
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please configure them in your env variables.'
      );
    }
    if (!supabaseInstance) {
      supabaseInstance = typeof window !== 'undefined'
        ? createBrowserClient(url, anonKey, { auth: authConfig as any })
        : createClient(url, anonKey, { auth: authConfig as any });
    }
    const value = Reflect.get(supabaseInstance, prop);
    if (typeof value === 'function') {
      return value.bind(supabaseInstance);
    }
    return value;
  },
});

// Lazy-loaded Admin client to avoid breaking public pages during build/runtime if key is empty
let supabaseAdminInstance: any = null;
export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      throw new Error(
        'Supabase URL or SUPABASE_SERVICE_ROLE_KEY is missing. Please configure them in your .env.local file.'
      );
    }
    if (!supabaseAdminInstance) {
      supabaseAdminInstance = createClient(supabaseUrl, serviceKey);
    }
    const value = Reflect.get(supabaseAdminInstance, prop);
    if (typeof value === 'function') {
      return value.bind(supabaseAdminInstance);
    }
    return value;
  },
});

