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
 * Get a weekly summary of progress.
 * Tries `child_id` first, falls back to `user_id` if a userId is provided
 * and the child query returns no rows. This handles cases where progress
 * was saved against the parent's auth id rather than a specific child.
 */
export async function getWeeklySummary(
  childId: string,
  userId?: string
): Promise<{
  subjectsStudied: string[];
  averageScore: number;
  totalSessions: number;
  totalMinutes: number;
}> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let data: Array<{
      subject: string;
      score: number | null;
      duration_seconds: number | null;
      created_at: string;
    }> | null = null;

    const { data: byChild, error: childError } = await supabase
      .from('progress')
      .select('subject, score, duration_seconds, created_at')
      .eq('child_id', childId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (!childError && byChild && byChild.length > 0) {
      data = byChild;
    } else if (userId) {
      const { data: byUser, error: userError } = await supabase
        .from('progress')
        .select('subject, score, duration_seconds, created_at')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (!userError) data = byUser;
    }

    if (!data || data.length === 0) {
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
 * Get the most recent progress entries (up to 20) for a child.
 * Tries `child_id` first; if that returns no rows and a userId is provided,
 * falls back to querying by `user_id`.
 */
export async function getChildProgressHistory(
  childId: string,
  userId?: string
): Promise<
  Array<{
    id: string;
    subject: string;
    topic: string | null;
    score: number | null;
    duration_seconds: number;
    created_at: string;
    grade: number | null;
  }>
> {
  try {
    const { data: byChild, error: childError } = await supabase
      .from('progress')
      .select('id, subject, topic, score, duration_seconds, created_at, grade')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!childError && byChild && byChild.length > 0) {
      return byChild;
    }

    if (userId) {
      const { data: byUser, error: userError } = await supabase
        .from('progress')
        .select('id, subject, topic, score, duration_seconds, created_at, grade')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!userError && byUser) return byUser;
    }

    return [];
  } catch (err) {
    console.error('getChildProgressHistory exception:', err);
    return [];
  }
}

/**
 * Reconstruct a child's saved learning state from their progress rows.
 * Sums total XP across all sessions and walks back from today to compute
 * the current streak (consecutive days ending on today). Returns null if
 * the underlying query fails.
 */
export async function loadChildProfile(childId: string): Promise<{
  xp: number;
  streak: number;
  lastStudyDate: string | null;
} | null> {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('xp_earned, created_at')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    const totalXP = data.reduce((sum, row) => sum + (row.xp_earned ?? 0), 0);

    const dates = data
      .map((row) => (row.created_at as string).split('T')[0])
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (dates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return {
      xp: totalXP,
      streak,
      lastStudyDate: dates[0] ?? null,
    };
  } catch (err) {
    console.error('loadChildProfile exception:', err);
    return null;
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
