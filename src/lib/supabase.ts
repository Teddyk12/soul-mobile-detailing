import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured with valid credentials
export const isSupabaseConfigured = () => {
  const configured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseUrl.startsWith('http')
  );

  if (typeof window !== 'undefined') {
    console.log('[SUPABASE CONFIG]', {
      configured,
      hasUrl: Boolean(supabaseUrl),
      hasKey: Boolean(supabaseAnonKey),
      urlValid: supabaseUrl !== 'your_supabase_url_here' && supabaseUrl.startsWith('http'),
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET'
    });
  }

  return configured;
};

// Only create Supabase client if properly configured
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
