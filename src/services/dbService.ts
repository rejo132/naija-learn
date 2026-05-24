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
 * Verify sync columns exist in Supabase (dev console check).
 */
export async function verifySyncColumns(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log('[verify] No user');
    return;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, xp, streak,' +
        'lessons_completed,' +
        'unlocked_achievements,' +
        'unlocked_avatars'
    )
    .eq('id', user.id)
    .single();

  if (error) {
    console.error(
      '[verify] Column check failed:',
      JSON.stringify(error)
    );
    console.error(
      '[verify] This means the SQL ' +
        'migration has NOT been run yet ' +
        'in Supabase. Run this SQL:\n' +
        'ALTER TABLE profiles ADD COLUMN ' +
        'IF NOT EXISTS lessons_completed ' +
        'integer DEFAULT 0;\n' +
        'ALTER TABLE profiles ADD COLUMN ' +
        'IF NOT EXISTS ' +
        'unlocked_achievements text[] ' +
        "DEFAULT '{}';\n" +
        'ALTER TABLE profiles ADD COLUMN ' +
        'IF NOT EXISTS unlocked_avatars ' +
        "text[] DEFAULT '{}';"
    );
  } else {
    console.log(
      '[verify] Supabase profile data:',
      JSON.stringify(data)
    );
    console.log('[verify] Column check PASSED ✅');
  }
}

/**
 * Sync the user's profile and progress to Supabase.
 */
export async function syncProfile(): Promise<void> {
  try {
    const store = useAppStore.getState();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const updates = {
      id: user.id,
      email: user.email ?? '',
      name: store.userName ?? '',
      grade: store.userGrade
        ? parseInt(store.userGrade.replace(/\D/g, ''), 10) || 0
        : 0,
      avatar: store.userAvatar ?? '🦁',
      username:
        store.userName?.toLowerCase().replace(/\s+/g, '_') ?? '',
      xp: store.xp ?? 0,
      streak: store.streak ?? 0,
      lessons_completed: store.lessonsCompleted ?? 0,
      language: store.selectedLanguage ?? 'en',
      personality_id: store.selectedPersonalityId ?? 'aunty_naija',
      last_active_date:
        store.lastStudyDate ?? new Date().toISOString().split('T')[0],
      unlocked_achievements: store.unlockedAchievements ?? [],
      unlocked_avatars: store.unlockedAvatars ?? [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates, {
      onConflict: 'id',
    });

    if (error) {
      console.error('[syncProfile] Error:', error.message);
      captureError(error, { context: 'syncProfile error' });
    } else {
      console.log('[syncProfile] ✅ Saved:', {
        xp: updates.xp,
        streak: updates.streak,
        lessons: updates.lessons_completed,
        name: updates.name,
      });
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[syncProfile] Exception:', message);
    captureError(e, { context: 'syncProfile exception' });
  }
}
