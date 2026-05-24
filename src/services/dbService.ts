/**
 * Database service for Learnova.
 * All Supabase database operations go through this file.
 * Never write supabase queries directly in screen components.
 *
 * Talks to:
 * - src/lib/supabase.ts for the Supabase client
 * - Used by: screens and stores that need to read/write data
 */
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { useAppStore } from '@/store/appStore';

// ─── Types ────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role?: 'parent' | 'child';
  created_at: string;
}

export interface ProfileUpdate {
  name?: string;
  grade?: number | string;
  avatar?: string;
  xp?: number;
  streak?: number;
  language?: string;
  personality_id?: string;
  last_active_date?: string;
  role?: string;
  lessons_completed?: number;
  unlocked_achievements?: string[];
  unlocked_avatars?: string[];
}

export interface ProgressEntry {
  id: string;
  child_id: string;
  subject: string;
  topic: string | null;
  score: number | null;
  duration_seconds: number;
  created_at: string;
}

// ─── Profile ──────────────────────────────────────────────

/**
 * Get the profile for the currently logged-in parent.
 * Returns null if not found.
 */
export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single();
  if (error) {
    captureError(error, { context: 'getProfile error' });
    return null;
  }
  return data;
}

/**
 * Update the parent's profile (name, phone).
 */
export async function updateProfile(
  updates: Partial<Pick<Profile, 'name' | 'phone'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '');
  if (error) {
    captureError(error, { context: 'updateProfile error' });
    return false;
  }
  return true;
}

// ─── Progress ─────────────────────────────────────────────

/**
 * Save a lesson or quiz result to Supabase.
 * Uses the upsert_progress RPC function.
 * Fires and forgets — never blocks the UI.
 */
export async function saveProgress({
  subject,
  topic,
  score,
  grade,
  xpEarned = 0,
  durationSeconds = 0,
  flowCompleted = false,
  childId,
}: {
  subject: string;
  topic: string;
  score: number;
  grade: number;
  xpEarned?: number;
  durationSeconds?: number;
  flowCompleted?: boolean;
  childId?: string | null;
}): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.rpc('upsert_progress', {
      p_user_id: user.id,
      p_child_id: childId ?? null,
      p_subject: subject,
      p_topic: topic,
      p_score: score,
      p_grade: grade,
      p_xp_earned: xpEarned,
      p_duration_seconds: durationSeconds,
      p_flow_completed: flowCompleted,
    });

    if (error) {
      captureError(error, { context: 'saveProgress error' });
      return false;
    }
    return true;
  } catch (err) {
    captureError(err, { context: 'saveProgress exception' });
    return false;
  }
}

/**
 * Load the user's saved progress from Supabase.
 * Called on app start to restore XP, streak, grade etc.
 */
export async function loadUserProgress(): Promise<{
  name: string;
  avatar: string;
  totalXP: number;
  streak: number;
  grade: number;
  language: string;
  personalityId: string;
  subjectProgress: Record<string, number>;
  lessonsCompleted: number;
} | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, avatar, xp, streak, grade, language, personality_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      captureError(profileError, { context: 'loadUserProgress profile error' });
      return null;
    }

    const { data: progressRows, error: progressError } = await supabase
      .from('progress')
      .select('subject, grade, score')
      .eq('user_id', user.id);

    if (progressError) {
      captureError(progressError, { context: 'loadUserProgress progress error' });
    }

    const subjectProgress: Record<string, number> = {};
    if (progressRows) {
      for (const row of progressRows) {
        const key = `${row.subject}_${row.grade}`;
        const existing = subjectProgress[key] ?? 0;
        if ((row.score ?? 0) > existing) {
          subjectProgress[key] = row.score ?? 0;
        }
      }
    }

    const { count: lessonsCompleted, error: countError } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      captureError(countError, { context: 'loadUserProgress count error' });
    }

    const gradeNum =
      typeof profile.grade === 'number'
        ? profile.grade
        : parseInt(String(profile.grade ?? '1'), 10) || 1;

    return {
      name: profile.name ?? '',
      avatar: profile.avatar ?? '🦁',
      totalXP: profile.xp ?? 0,
      streak: profile.streak ?? 0,
      grade: gradeNum,
      language: profile.language ?? 'en',
      personalityId: profile.personality_id ?? 'aunty_naija',
      subjectProgress,
      lessonsCompleted: lessonsCompleted ?? 0,
    };
  } catch (err) {
    captureError(err, { context: 'loadUserProgress exception' });
    return null;
  }
}

/**
 * Sync the user's profile and progress to Supabase.
 * Reads from the app store; optional overrides for sign-up etc.
 */
export async function syncProfile(overrides?: Partial<ProfileUpdate>): Promise<void> {
  try {
    const store = useAppStore.getState();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const gradeValue =
      overrides?.grade ??
      (store.userGrade ||
        (store.selectedGrade ? `Primary ${store.selectedGrade}` : ''));

    const updates: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      name: overrides?.name ?? (store.userName || ''),
      grade: String(gradeValue),
      avatar: overrides?.avatar ?? (store.userAvatar || '🦁'),
      xp: overrides?.xp ?? store.xp ?? 0,
      streak: overrides?.streak ?? store.streak ?? 0,
      language: overrides?.language ?? (store.selectedLanguage || 'en'),
      personality_id:
        overrides?.personality_id ??
        store.selectedPersonalityId ??
        'aunty_naija',
      last_active_date:
        overrides?.last_active_date ??
        store.lastStudyDate ??
        new Date().toISOString().split('T')[0],
      lessons_completed:
        overrides?.lessons_completed ?? store.lessonsCompleted ?? 0,
      unlocked_achievements:
        overrides?.unlocked_achievements ??
        store.unlockedAchievements ??
        [],
      unlocked_avatars:
        overrides?.unlocked_avatars ?? store.unlockedAvatars ?? [],
      updated_at: new Date().toISOString(),
      ...overrides,
    };

    const { error } = await supabase.from('profiles').upsert(updates, {
      onConflict: 'id',
    });

    if (error) {
      console.error(
        '[syncProfile] Supabase error:',
        JSON.stringify(error)
      );
      captureError(error, { context: 'syncProfile error' });
      throw error;
    }

    console.log('[syncProfile] Saved to Supabase:', {
      xp: updates.xp,
      streak: updates.streak,
      lessons: updates.lessons_completed,
    });
  } catch (err) {
    captureError(err, { context: 'syncProfile exception' });
    throw err;
  }
}
