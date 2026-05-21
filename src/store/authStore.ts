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
import { getProfile } from '@/services/dbService';

export type UserRole = 'parent' | 'child';

async function fetchUserRole(): Promise<UserRole | null> {
  const profile = await getProfile();
  if (!profile) return null;
  if (profile.role === 'parent' || profile.role === 'child') {
    return profile.role;
  }
  return 'child';
}

interface AuthState {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: Session | null) => void;
  setUserRole: (role: UserRole | null) => void;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialise: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  userRole: null,
  isLoading: false,
  error: null,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setUserRole: (role) => set({ userRole: role }),

  initialise: async () => {
    // Skip during SSR — window is not available
    if (typeof window === 'undefined') return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const role = await fetchUserRole();
      set({ session, user: session.user, userRole: role });
    } else {
      set({ session: null, user: null, userRole: null });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await fetchUserRole();
        set({ session, user: session.user, userRole: role });
      } else {
        set({ session: null, user: null, userRole: null });
      }
    });
  },

  signUp: async (email, password, name, phone) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
          emailRedirectTo: 'https://trylearnova.com/auth/callback',
        },
      });
      if (error) throw error;
      // Set session directly if available (email confirmation off)
      if (data.session) {
        const role = await fetchUserRole();
        set({
          session: data.session,
          user: data.session.user,
          userRole: role,
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
      const role = await fetchUserRole();
      // Set session directly — don't wait for onAuthStateChange
      set({
        session: data.session,
        user: data.session?.user ?? null,
        userRole: role,
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
      set({ session: null, user: null, userRole: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
