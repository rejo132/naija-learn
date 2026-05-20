/**
 * Achievement definitions for Learnova gamification system.
 * Achievements are unlocked based on XP, streaks, and lessons completed.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
  requirement: {
    type: 'xp' | 'streak' | 'lessons' | 'quiz_score';
    value: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    title: 'First Step!',
    description: 'Completed your first lesson',
    emoji: '🌱',
    color: '#1B7340',
    bgColor: '#dcfce7',
    requirement: { type: 'lessons', value: 1 },
  },
  {
    id: 'streak_3',
    title: '3 Day Streak!',
    description: 'Studied 3 days in a row',
    emoji: '🔥',
    color: '#DC2626',
    bgColor: '#fee2e2',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    title: 'One Week Strong!',
    description: 'Studied 7 days in a row',
    emoji: '⚡',
    color: '#D97706',
    bgColor: '#fef3c7',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'xp_100',
    title: 'Century!',
    description: 'Earned 100 XP',
    emoji: '💯',
    color: '#7C3AED',
    bgColor: '#ede9fe',
    requirement: { type: 'xp', value: 100 },
  },
  {
    id: 'xp_500',
    title: 'Rising Star!',
    description: 'Earned 500 XP',
    emoji: '⭐',
    color: '#D97706',
    bgColor: '#fef3c7',
    requirement: { type: 'xp', value: 500 },
  },
  {
    id: 'xp_1000',
    title: 'Champion!',
    description: 'Earned 1000 XP',
    emoji: '🏆',
    color: '#B45309',
    bgColor: '#fef3c7',
    requirement: { type: 'xp', value: 1000 },
  },
  {
    id: 'perfect_quiz',
    title: 'Perfect Score!',
    description: 'Got 100% on a quiz',
    emoji: '🎯',
    color: '#1D4ED8',
    bgColor: '#dbeafe',
    requirement: { type: 'quiz_score', value: 100 },
  },
  {
    id: 'lessons_10',
    title: 'Dedicated Learner!',
    description: 'Completed 10 lessons',
    emoji: '📚',
    color: '#047857',
    bgColor: '#d1fae5',
    requirement: { type: 'lessons', value: 10 },
  },
  {
    id: 'lessons_50',
    title: 'Scholar!',
    description: 'Completed 50 lessons',
    emoji: '🎓',
    color: '#1B7340',
    bgColor: '#dcfce7',
    requirement: { type: 'lessons', value: 50 },
  },
];

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  LESSON_STARTED: 10,
  QUIZ_COMPLETED: 25,
  PERFECT_QUIZ: 50,
  DAILY_STREAK: 15,
  FIRST_LESSON_OF_DAY: 20,
};

/**
 * Calculate level from XP
 * Every 100 XP = 1 level
 */
export function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(xp: number): number {
  const currentLevel = getLevel(xp);
  return currentLevel * 100 - xp;
}

/** Threshold-based achievement definitions for live unlock checks. */
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_lesson',
    title: 'First Step',
    description: 'Complete your first lesson',
    emoji: '🌟',
    requirement: { type: 'lessonsCompleted', value: 1 },
  },
  {
    id: 'five_lessons',
    title: 'Getting Going',
    description: 'Complete 5 lessons',
    emoji: '📚',
    requirement: { type: 'lessonsCompleted', value: 5 },
  },
  {
    id: 'ten_lessons',
    title: 'Scholar',
    description: 'Complete 10 lessons',
    emoji: '🎓',
    requirement: { type: 'lessonsCompleted', value: 10 },
  },
  {
    id: 'first_quiz',
    title: 'Quiz Starter',
    description: 'Score on your first quiz',
    emoji: '✏️',
    requirement: { type: 'bestQuizScore', value: 1 },
  },
  {
    id: 'perfect_quiz',
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    emoji: '💯',
    requirement: { type: 'bestQuizScore', value: 100 },
  },
  {
    id: 'xp_100',
    title: 'XP Hunter',
    description: 'Earn 100 XP',
    emoji: '⚡',
    requirement: { type: 'xp', value: 100 },
  },
  {
    id: 'xp_500',
    title: 'XP Master',
    description: 'Earn 500 XP',
    emoji: '🏆',
    requirement: { type: 'xp', value: 500 },
  },
  {
    id: 'streak_3',
    title: 'Hat Trick',
    description: 'Study 3 days in a row',
    emoji: '🔥',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Study 7 days in a row',
    emoji: '💪',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Study 30 days in a row',
    emoji: '🚀',
    requirement: { type: 'streak', value: 30 },
  },
] as const;

export type AchievementDefinition = (typeof ACHIEVEMENT_DEFINITIONS)[number];

export function getUnlockedAchievements(stats: {
  xp: number;
  streak: number;
  lessonsCompleted: number;
  bestQuizScore: number;
}) {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => {
    const val = stats[a.requirement.type as keyof typeof stats];
    return val >= a.requirement.value;
  });
}

/** Visual styles for achievement cards (lookup by id). */
const ACHIEVEMENT_STYLES: Record<string, { color: string; bgColor: string }> = {
  first_lesson: { color: '#1B7340', bgColor: '#dcfce7' },
  five_lessons: { color: '#047857', bgColor: '#d1fae5' },
  ten_lessons: { color: '#1B7340', bgColor: '#dcfce7' },
  first_quiz: { color: '#1D4ED8', bgColor: '#dbeafe' },
  perfect_quiz: { color: '#1D4ED8', bgColor: '#dbeafe' },
  xp_100: { color: '#7C3AED', bgColor: '#ede9fe' },
  xp_500: { color: '#D97706', bgColor: '#fef3c7' },
  streak_3: { color: '#DC2626', bgColor: '#fee2e2' },
  streak_7: { color: '#D97706', bgColor: '#fef3c7' },
  streak_30: { color: '#B45309', bgColor: '#fef3c7' },
};

export function getAchievementStyle(id: string): { color: string; bgColor: string } {
  if (ACHIEVEMENT_STYLES[id]) return ACHIEVEMENT_STYLES[id];
  const existing = ACHIEVEMENTS.find((a) => a.id === id);
  if (existing) return { color: existing.color, bgColor: existing.bgColor };
  return { color: '#1B7340', bgColor: '#dcfce7' };
}

function definitionToAchievement(def: AchievementDefinition): Achievement {
  const style = getAchievementStyle(def.id);
  const requirementType =
    def.requirement.type === 'lessonsCompleted'
      ? 'lessons'
      : def.requirement.type === 'bestQuizScore'
        ? 'quiz_score'
        : def.requirement.type;
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
    color: style.color,
    bgColor: style.bgColor,
    requirement: {
      type: requirementType as Achievement['requirement']['type'],
      value: def.requirement.value,
    },
  };
}

/**
 * Check which achievements are newly unlocked
 * given current stats (uses ACHIEVEMENT_DEFINITIONS).
 */
export function checkNewAchievements(
  stats: { xp: number; streak: number; lessonsCompleted: number; bestQuizScore: number },
  alreadyUnlocked: string[]
): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => {
    if (alreadyUnlocked.includes(a.id)) return false;
    const val = stats[a.requirement.type as keyof typeof stats];
    return val >= a.requirement.value;
  }).map(definitionToAchievement);
}
