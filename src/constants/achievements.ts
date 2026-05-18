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

/**
 * Check which achievements are newly unlocked
 * given current stats
 */
export function checkNewAchievements(
  stats: { xp: number; streak: number; lessonsCompleted: number; bestQuizScore: number },
  alreadyUnlocked: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    if (alreadyUnlocked.includes(a.id)) return false;
    switch (a.requirement.type) {
      case 'xp': return stats.xp >= a.requirement.value;
      case 'streak': return stats.streak >= a.requirement.value;
      case 'lessons': return stats.lessonsCompleted >= a.requirement.value;
      case 'quiz_score': return stats.bestQuizScore >= a.requirement.value;
      default: return false;
    }
  });
}
