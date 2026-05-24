import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/env';

/**
 * Supabase client instance.
 * Auth storage is set lazily to avoid SSR crashes on web —
 * AsyncStorage requires window which doesn't exist during
 * server-side rendering.
 */

// Lazy storage getter — only accesses AsyncStorage on the client
const getStorage = () => {
  if (typeof window === 'undefined') {
    // SSR — return a no-op storage
    return {
      getItem: (_key: string) => Promise.resolve(null),
      setItem: (_key: string, _value: string) => Promise.resolve(),
      removeItem: (_key: string) => Promise.resolve(),
    };
  }
  // Client — use real AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage;
};

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
