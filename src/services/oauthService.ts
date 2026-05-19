/**
 * OAuth authentication service.
 * Handles Google and Microsoft sign-in via Supabase Auth.
 *
 * Talks to:
 * - `@/lib/supabase` for the auth client
 * - `expo-web-browser` to open the provider sign-in page on native
 * - `expo-auth-session` to build the native redirect URI
 *
 * Used by: `app/auth/sign-in.tsx` (and `app/auth/sign-up.tsx` if/when social
 * buttons are added there).
 */
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Google via Supabase OAuth.
 * Opens the browser for the OAuth flow, then redirects back.
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const redirectTo =
      Platform.OS === 'web'
        ? window.location.origin
        : makeRedirectUri({ scheme: 'learnova' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (Platform.OS === 'web' && data.url) {
      window.location.href = data.url;
      return { success: true };
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        makeRedirectUri({ scheme: 'learnova' })
      );
      if (result.type === 'success') {
        return { success: true };
      }
      return { success: false, error: 'Auth cancelled' };
    }

    return { success: false, error: 'No auth URL returned' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google sign in failed';
    return { success: false, error: message };
  }
}

/**
 * Sign in with Microsoft via Supabase OAuth (Azure provider).
 */
export async function signInWithMicrosoft(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const redirectTo =
      Platform.OS === 'web'
        ? window.location.origin
        : makeRedirectUri({ scheme: 'learnova' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo,
        scopes: 'email profile openid',
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (Platform.OS === 'web' && data.url) {
      window.location.href = data.url;
      return { success: true };
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        makeRedirectUri({ scheme: 'learnova' })
      );
      if (result.type === 'success') {
        return { success: true };
      }
      return { success: false, error: 'Auth cancelled' };
    }

    return { success: false, error: 'No auth URL returned' };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Microsoft sign in failed';
    return { success: false, error: message };
  }
}
