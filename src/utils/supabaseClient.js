import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== ''
);

// Create client only if configuration is present, otherwise null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Local Storage Persistence Keys for Offline / Demo Mode
 */
const STORAGE_KEYS = {
  VILLAGES: 'sat_villages_v1',
  TERMINALS: 'sat_terminals_v1',
  PROVIDERS: 'sat_providers_v1',
  MEASUREMENTS: 'sat_measurements_v1',
  ALERTS: 'sat_alerts_v1',
  ADMIN_SESSION: 'sat_admin_session_v1',
  SETTINGS: 'sat_settings_v1',
  LAST_SYNC: 'sat_last_sync_timestamp'
};

export { STORAGE_KEYS };
