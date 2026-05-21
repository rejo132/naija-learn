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

// ─── Types ────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role?: 'parent' | 'child';
  created_at: string;
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
  totalXP: number;
  streak: number;
  grade: number;
  language: string;
  personalityId: string;
  subjectProgress: Record<string, number>;
} | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, xp, streak, grade, language, personality_id')
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

    const gradeNum =
      typeof profile.grade === 'number'
        ? profile.grade
        : parseInt(String(profile.grade ?? '1'), 10) || 1;

    return {
      name: profile.name ?? '',
      totalXP: profile.xp ?? 0,
      streak: profile.streak ?? 0,
      grade: gradeNum,
      language: profile.language ?? 'en',
      personalityId: profile.personality_id ?? 'aunty_naija',
      subjectProgress,
    };
  } catch (err) {
    captureError(err, { context: 'loadUserProgress exception' });
    return null;
  }
}

/**
 * Sync the user's XP, streak, and preferences
 * back to Supabase so they persist across devices.
 * Call this when XP or streak changes.
 */
export async function syncProfile({
  name,
  grade,
  avatar,
  xp,
  streak,
  language,
  personalityId,
  lastActiveDate,
  role,
}: {
  name?: string;
  grade?: number | string;
  avatar?: string;
  xp: number;
  streak: number;
  language: string;
  personalityId: string;
  lastActiveDate: string;
  role?: string;
}): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const updates: Record<string, unknown> = {
      xp,
      streak,
      language,
      personality_id: personalityId,
      last_active_date: lastActiveDate,
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (grade !== undefined) updates.grade = String(grade);
    if (avatar !== undefined) updates.avatar = avatar;
    if (role !== undefined) updates.role = role;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      captureError(error, { context: 'syncProfile error' });
    }
  } catch (err) {
    captureError(err, { context: 'syncProfile exception' });
  }
}

