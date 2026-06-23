/**
 * Supabase client. Only the project URL + **publishable** key reach the app
 * (both come in via `EXPO_PUBLIC_*`, so they're inlined into the bundle — that's
 * fine, they're meant to be public). The `sb_secret_` key is server/script-only
 * and must never be imported here. Row Level Security is what actually protects
 * data, so the publishable key can't read another user's rows.
 *
 * Session is persisted to AsyncStorage and auto-refreshed while the app is in
 * the foreground — this is the offline-first foundation Phase 4/5 builds on.
 *
 * Docs: https://supabase.com/docs/guides/auth/quickstarts/react-native
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copy them from .env.example into .env.local and restart the dev server.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Native has no URL to read a session from; on web the OAuth redirect lands
    // back in the page, so let supabase-js pick the session up there.
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Refresh the token only while the app is foregrounded; pausing in the
// background avoids needless network churn (recommended by Supabase).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
