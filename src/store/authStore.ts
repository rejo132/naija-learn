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
import { useAppStore } from '@/store/appStore';

export type UserRole = 'parent' | 'child';

export interface AuthProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  grade: string | null;
  xp: number | null;
  streak: number | null;
  language: string | null;
  personality_id: string | null;
}

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

  setSession: (session: Session | null) => void;
  setUserRole: (role: UserRole | null) => void;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialise: () => Promise<void>;
  fetchProfile: () => Promise<AuthProfile | null>;
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

  fetchProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar, grade, xp, streak, language, personality_id')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;
    return data as AuthProfile;
  },

  initialise: async () => {
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
      set({
        session: data.session,
        user: data.session?.user ?? null,
        userRole: role,
      });

      const { userGrade, setupComplete, isSignedOut } = useAppStore.getState();
      if (isSignedOut && (userGrade?.trim() || setupComplete)) {
        useAppStore.getState().setIsSignedOut(false);
        useAppStore.getState().loadUserProgress().catch(() => {});
      } else if (!userGrade?.trim() && !setupComplete) {
        await useAppStore.getState().loadUserProgress();
      } else {
        useAppStore.getState().setIsSignedOut(false);
        useAppStore.getState().loadUserProgress().catch(() => {});
      }
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
      useAppStore.getState().resetSession();
      useAppStore.getState().setIsSignedOut(true);
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
