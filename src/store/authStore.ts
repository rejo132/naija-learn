/**
 * Authentication state (Zustand).
 */
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

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
  signIn: (identifier: string, password: string) => Promise<void>;
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
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return (data as AuthProfile) ?? null;
    } catch {
      return null;
    }
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
          emailRedirectTo: 'https://trylearnova.com/auth/sign-in',
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

  signIn: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      let emailToUse = identifier.trim();

      if (!identifier.includes('@')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, id')
          .ilike('username', identifier.trim())
          .maybeSingle();

        if (!profile) {
          const msg =
            'No account found with that username. Try your email instead.';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }

        if (!profile.email) {
          const msg =
            'No account found with that username. Try your email instead.';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }

        emailToUse = profile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        const msg = error.message.includes('Invalid login credentials')
          ? 'Wrong email/username or password. Try again.'
          : error.message.includes('Email not confirmed')
            ? 'Please check your email and confirm your account.'
            : error.message.includes('Too many requests')
              ? 'Too many attempts. Please wait and try again.'
              : error.message;
        set({ error: msg, isLoading: false });
        throw new Error(msg);
      }

      if (data.session) {
        set({
          session: data.session,
          user: data.session.user,
          userRole: await fetchUserRole(),
          isLoading: false,
        });

        try {
          await useAppStore.getState().loadUserProgress();
        } catch (e) {
          console.error('loadUserProgress failed:', e);
        }

        useAppStore.getState().setIsSignedOut(false);
      }
    } catch (err: unknown) {
      if (!(err instanceof Error && useAuthStore.getState().error)) {
        const message = err instanceof Error ? err.message : 'Sign in failed';
        set({ error: message });
      }
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
