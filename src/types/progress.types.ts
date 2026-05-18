/**
 * Progress tracking types.
 * Used to track child learning over time and generate parent reports.
 */

/**
 * Outcome of a single learning or quiz session.
 */
export interface SessionResult {
  /** Unique identifier for this session record. */
  id: string;
  /** Child who completed the session. */
  childId: string;
  /** Subject studied (name or ID). */
  subject: string;
  /** Topic covered in the session. */
  topic: string;
  /** Percentage score for the session (0–100). */
  score: number;
  /** Total number of questions attempted. */
  totalQuestions: number;
  /** Number of questions answered correctly. */
  correctAnswers: number;
  /** Time spent in the session, in seconds. */
  durationSeconds: number;
  /** ISO 8601 timestamp when the session ended. */
  createdAt: string;
}

/**
 * Aggregated learning stats for one child over a calendar week.
 */
export interface WeeklyProgress {
  /** Child this summary applies to. */
  childId: string;
  /** ISO date string for the Monday (or locale week start) of the report week. */
  weekStart: string;
  /** Subject names or IDs studied at least once this week. */
  subjectsStudied: string[];
  /** Mean session score across the week (0–100). */
  averageScore: number;
  /** Consecutive days with at least one completed session. */
  streakDays: number;
  /** Total active learning time for the week, in minutes. */
  totalMinutes: number;
}
