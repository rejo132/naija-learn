/**
 * Authentication state (Zustand).
 *
 * Responsible for: tracking the current Supabase session,
 * sign up, sign in, sign out, and loading state.
 *
 * Talks to:
 * - src/lib/supabase.ts for all auth operations
 * - Used by: auth screens and root layout
 */
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: Session | null) => void;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialise: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  error: null,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  initialise: async () => {
    // Skip during SSR — window is not available
    if (typeof window === 'undefined') return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signUp: async (email, password, name, phone) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });
      if (error) throw error;
      // Set session directly if available (email confirmation off)
      if (data.session) {
        set({
          session: data.session,
          user: data.session.user,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Set session directly — don't wait for onAuthStateChange
      set({
        session: data.session,
        user: data.session?.user ?? null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.signOut();
      set({ session: null, user: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
