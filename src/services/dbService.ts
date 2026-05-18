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
 * Save a completed lesson session to the database.
 * Called automatically when a quiz completes or lesson ends.
 */
export async function saveProgress(
  entry: Pick<ProgressEntry, 'child_id' | 'subject' | 'topic' | 'score' | 'duration_seconds'>
): Promise<boolean> {
  console.log('Attempting to save progress:', JSON.stringify(entry));
  const { error } = await supabase
    .from('progress')
    .insert(entry);
  if (error) {
    console.error('saveProgress supabase error:', error.message, error.code, error.details);
    return false;
  }
  return true;
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
 * Get a summary of progress for a child in the last 7 days.
 * Returns: subjects studied, average score, total sessions.
 */
export async function getWeeklySummary(childId: string): Promise<{
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
  const avgScore = scores.length > 0
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
