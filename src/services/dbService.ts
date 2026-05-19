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

// ─── Types ────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role?: 'parent' | 'child';
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age: number | null;
  grade: number;
  language_preference: string;
  avatar: string;
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
    console.error('getProfile error:', error.message);
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
    console.error('updateProfile error:', error.message);
    return false;
  }
  return true;
}

// ─── Children ─────────────────────────────────────────────

/**
 * Get all children belonging to the logged-in parent.
 */
export async function getChildren(): Promise<Child[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('getChildren error:', error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Add a new child profile under the logged-in parent.
 */
export async function addChild(
  child: Pick<Child, 'name' | 'age' | 'grade' | 'language_preference' | 'avatar'>
): Promise<Child | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('children')
    .insert({ ...child, parent_id: user.id })
    .select()
    .single();
  if (error) {
    console.error('addChild error:', error.message);
    return null;
  }
  return data;
}

/**
 * Delete a child profile by ID.
 */
export async function deleteChild(childId: string): Promise<boolean> {
  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', childId);
  if (error) {
    console.error('deleteChild error:', error.message);
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
      console.error('saveProgress error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('saveProgress exception:', err);
    return false;
  }
}

/**
 * Load the user's saved progress from Supabase.
 * Called on app start to restore XP, streak, grade etc.
 */
export async function loadUserProgress(): Promise<{
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
      .select('xp, streak, grade, language, personality_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('loadUserProgress profile error:', profileError?.message);
      return null;
    }

    const { data: progressRows, error: progressError } = await supabase
      .from('progress')
      .select('subject, grade, score')
      .eq('user_id', user.id);

    if (progressError) {
      console.error('loadUserProgress progress error:', progressError.message);
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

    return {
      totalXP: profile.xp ?? 0,
      streak: profile.streak ?? 0,
      grade: profile.grade ?? 1,
      language: profile.language ?? 'en',
      personalityId: profile.personality_id ?? 'aunty_naija',
      subjectProgress,
    };
  } catch (err) {
    console.error('loadUserProgress exception:', err);
    return null;
  }
}

/**
 * Sync the user's XP, streak, and preferences
 * back to Supabase so they persist across devices.
 * Call this when XP or streak changes.
 */
export async function syncProfile({
  xp,
  streak,
  grade,
  language,
  personalityId,
  lastActiveDate,
}: {
  xp: number;
  streak: number;
  grade: number;
  language: string;
  personalityId: string;
  lastActiveDate: string;
}): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        xp,
        streak,
        grade,
        language,
        personality_id: personalityId,
        last_active_date: lastActiveDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('syncProfile error:', error.message);
    }
  } catch (err) {
    console.error('syncProfile exception:', err);
  }
}

/**
 * Get a weekly summary of progress for a specific user.
 * Used by parent dashboard to show this week's activity.
 */
export async function getWeeklySummary(userId: string): Promise<{
  subjectsStudied: string[];
  averageScore: number;
  totalSessions: number;
  totalMinutes: number;
}> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('progress')
      .select('subject, score, duration_seconds')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error || !data) {
      return {
        subjectsStudied: [],
        averageScore: 0,
        totalSessions: 0,
        totalMinutes: 0,
      };
    }

    const subjects = [...new Set(data.map((p) => p.subject))];
    const scores = data
      .filter((p) => p.score !== null)
      .map((p) => p.score as number);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    const totalSeconds = data.reduce(
      (a, b) => a + (b.duration_seconds ?? 0),
      0
    );

    return {
      subjectsStudied: subjects,
      averageScore: avgScore,
      totalSessions: data.length,
      totalMinutes: Math.round(totalSeconds / 60),
    };
  } catch (err) {
    console.error('getWeeklySummary exception:', err);
    return {
      subjectsStudied: [],
      averageScore: 0,
      totalSessions: 0,
      totalMinutes: 0,
    };
  }
}

/**
 * Get all progress entries for a specific child.
 * Returns newest first.
 */
export async function getChildProgress(childId: string): Promise<ProgressEntry[]> {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getChildProgress error:', error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Get a summary of progress for a child in the last 7 days (by child_id).
 * Used by the parent dashboard when viewing individual child profiles.
 */
export async function getChildWeeklySummary(childId: string): Promise<{
  subjectsStudied: string[];
  averageScore: number;
  totalSessions: number;
  totalMinutes: number;
}> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('child_id', childId)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (error || !data) {
    return { subjectsStudied: [], averageScore: 0, totalSessions: 0, totalMinutes: 0 };
  }

  const subjects = [...new Set(data.map((p) => p.subject))];
  const scores = data.filter((p) => p.score !== null).map((p) => p.score as number);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const totalSeconds = data.reduce((a, b) => a + (b.duration_seconds ?? 0), 0);

  return {
    subjectsStudied: subjects,
    averageScore: avgScore,
    totalSessions: data.length,
    totalMinutes: Math.round(totalSeconds / 60),
  };
}
