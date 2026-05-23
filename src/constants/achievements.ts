/**
 * Achievement definitions for Learnova gamification system.
 * Achievements are unlocked based on XP, streaks, lessons completed, and more.
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

export type AchievementCategory =
  | 'streak'
  | 'lessons'
  | 'quiz'
  | 'xp'
  | 'consistency'
  | 'mastery'
  | 'exploration'
  | 'milestone';

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

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_lesson',
    title: 'First Step',
    description: 'Complete your first lesson',
    emoji: '🌟',
    category: 'lessons' as const,
    requirement: { type: 'lessonsCompleted', value: 1 },
  },
  {
    id: 'five_lessons',
    title: 'Getting Going',
    description: 'Complete 5 lessons',
    emoji: '📚',
    category: 'lessons' as const,
    requirement: { type: 'lessonsCompleted', value: 5 },
  },
  {
    id: 'ten_lessons',
    title: 'Scholar',
    description: 'Complete 10 lessons',
    emoji: '🎓',
    category: 'lessons' as const,
    requirement: { type: 'lessonsCompleted', value: 10 },
  },
  {
    id: 'first_quiz',
    title: 'Quiz Starter',
    description: 'Score on your first quiz',
    emoji: '✏️',
    category: 'quiz' as const,
    requirement: { type: 'bestQuizScore', value: 1 },
  },
  {
    id: 'perfect_quiz',
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    emoji: '💯',
    category: 'quiz' as const,
    requirement: { type: 'bestQuizScore', value: 100 },
  },
  {
    id: 'xp_100',
    title: 'XP Hunter',
    description: 'Earn 100 XP',
    emoji: '⚡',
    category: 'xp' as const,
    requirement: { type: 'xp', value: 100 },
  },
  {
    id: 'xp_500',
    title: 'XP Master',
    description: 'Earn 500 XP',
    emoji: '🏆',
    category: 'xp' as const,
    requirement: { type: 'xp', value: 500 },
  },
  {
    id: 'streak_3',
    title: 'Hat Trick',
    description: 'Study 3 days in a row',
    emoji: '🔥',
    category: 'streak' as const,
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Study 7 days in a row',
    emoji: '💪',
    category: 'streak' as const,
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Study 30 days in a row',
    emoji: '🚀',
    category: 'streak' as const,
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'early_bird',
    title: 'Early Bird 🌅',
    description: 'Complete a lesson before 9am',
    emoji: '🌅',
    category: 'consistency' as const,
  },
  {
    id: 'night_owl',
    title: 'Night Owl 🌙',
    description: 'Complete a lesson after 8pm',
    emoji: '🌙',
    category: 'consistency' as const,
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior 📅',
    description: 'Complete lessons on both Saturday and Sunday',
    emoji: '📅',
    category: 'consistency' as const,
  },
  {
    id: 'english_expert',
    title: 'English Expert 📚',
    description: 'Complete 10 English Studies lessons',
    emoji: '📚',
    category: 'mastery' as const,
  },
  {
    id: 'maths_master',
    title: 'Maths Master 🔢',
    description: 'Complete 10 Mathematics lessons',
    emoji: '🔢',
    category: 'mastery' as const,
  },
  {
    id: 'science_star',
    title: 'Science Star 🌍',
    description: 'Complete 10 Basic Science lessons',
    emoji: '🌍',
    category: 'mastery' as const,
  },
  {
    id: 'naija_proud',
    title: 'Naija Proud 🇳🇬',
    description: 'Complete a Nigerian History lesson',
    emoji: '🇳🇬',
    category: 'mastery' as const,
  },
  {
    id: 'sharp_shooter',
    title: 'Sharp Shooter 🎯',
    description: 'Get 3 perfect quiz scores in a row',
    emoji: '🎯',
    category: 'quiz' as const,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon ⚡',
    description: 'Complete a quiz in under 60 seconds',
    emoji: '⚡',
    category: 'quiz' as const,
  },
  {
    id: 'never_give_up',
    title: 'Never Give Up 💪',
    description: 'Retry a failed quiz and pass it',
    emoji: '💪',
    category: 'quiz' as const,
  },
  {
    id: 'multilingual',
    title: 'Multilingual 🗣️',
    description: 'Complete a lesson in a language other than English',
    emoji: '🗣️',
    category: 'exploration' as const,
  },
  {
    id: 'explorer',
    title: 'Explorer 🌟',
    description: 'Try all subjects at least once',
    emoji: '🌟',
    category: 'exploration' as const,
  },
  {
    id: 'creative_soul',
    title: 'Creative Soul 🎨',
    description: 'Complete a Cultural and Creative Arts lesson',
    emoji: '🎨',
    category: 'exploration' as const,
  },
  {
    id: 'active_learner',
    title: 'Active Learner 🏃',
    description: 'Complete 3 lessons in one day',
    emoji: '🏃',
    category: 'exploration' as const,
  },
  {
    id: 'century_club',
    title: 'Century Club 💯',
    description: 'Complete 100 lessons total',
    emoji: '💯',
    category: 'milestone' as const,
  },
  {
    id: 'on_fire',
    title: 'On Fire 🔥',
    description: 'Maintain a 14-day streak',
    emoji: '🔥',
    category: 'milestone' as const,
  },
  {
    id: 'learnova_legend',
    title: 'Learnova Legend 👑',
    description: 'Unlock all other achievements',
    emoji: '👑',
    category: 'milestone' as const,
  },
] as const;

export type AchievementDefinition = (typeof ACHIEVEMENT_DEFINITIONS)[number];

export type AchievementStats = {
  xp: number;
  streak: number;
  lessonsCompleted: number;
  bestQuizScore: number;
  weekendLessons?: number;
  consecutivePerfectQuizzes?: number;
  fastestQuizSeconds?: number | null;
  retriedAndPassedQuiz?: boolean;
  nonEnglishLessons?: number;
  uniqueSubjectsTried?: number;
  todaysLessons?: number;
  subjectLessons?: Record<string, number>;
  unlockedAchievements?: string[];
};

function checkAchievementThreshold(
  id: string,
  stats: AchievementStats
): boolean {
  switch (id) {
    case 'early_bird': {
      const hour = new Date().getHours();
      return stats.lessonsCompleted >= 1 && hour < 9;
    }
    case 'night_owl': {
      const hour = new Date().getHours();
      return stats.lessonsCompleted >= 1 && hour >= 20;
    }
    case 'weekend_warrior':
      return (stats.weekendLessons ?? 0) >= 2;
    case 'english_expert':
      return (stats.subjectLessons?.['English Studies'] ?? 0) >= 10;
    case 'maths_master':
      return (stats.subjectLessons?.['Mathematics'] ?? 0) >= 10;
    case 'science_star':
      return (stats.subjectLessons?.['Basic Science'] ?? 0) >= 10;
    case 'naija_proud':
      return (stats.subjectLessons?.['Nigerian History'] ?? 0) >= 1;
    case 'sharp_shooter':
      return (stats.consecutivePerfectQuizzes ?? 0) >= 3;
    case 'speed_demon':
      return (
        stats.fastestQuizSeconds !== null &&
        stats.fastestQuizSeconds !== undefined &&
        stats.fastestQuizSeconds <= 60
      );
    case 'never_give_up':
      return stats.retriedAndPassedQuiz === true;
    case 'multilingual':
      return (stats.nonEnglishLessons ?? 0) >= 1;
    case 'explorer':
      return (stats.uniqueSubjectsTried ?? 0) >= 10;
    case 'creative_soul':
      return (stats.subjectLessons?.['Cultural & Creative Arts'] ?? 0) >= 1;
    case 'active_learner':
      return (stats.todaysLessons ?? 0) >= 3;
    case 'century_club':
      return stats.lessonsCompleted >= 100;
    case 'on_fire':
      return stats.streak >= 14;
    case 'learnova_legend':
      return (
        (stats.unlockedAchievements?.length ?? 0) >=
        ACHIEVEMENT_DEFINITIONS.length - 1
      );
    default: {
      const achievement = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
      if (!achievement || !('requirement' in achievement) || !achievement.requirement) {
        return false;
      }
      const val = stats[achievement.requirement.type as keyof AchievementStats];
      return typeof val === 'number' && val >= achievement.requirement.value;
    }
  }
}

export function getUnlockedAchievements(
  stats: AchievementStats,
  persistedUnlocked: string[] = []
) {
  return ACHIEVEMENT_DEFINITIONS.filter(
    (a) =>
      persistedUnlocked.includes(a.id) || checkAchievementThreshold(a.id, stats)
  );
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
  early_bird: { color: '#D97706', bgColor: '#fef3c7' },
  night_owl: { color: '#4338CA', bgColor: '#e0e7ff' },
  weekend_warrior: { color: '#059669', bgColor: '#d1fae5' },
  english_expert: { color: '#1D4ED8', bgColor: '#dbeafe' },
  maths_master: { color: '#7C3AED', bgColor: '#ede9fe' },
  science_star: { color: '#059669', bgColor: '#d1fae5' },
  naija_proud: { color: '#1B7340', bgColor: '#dcfce7' },
  sharp_shooter: { color: '#DC2626', bgColor: '#fee2e2' },
  speed_demon: { color: '#D97706', bgColor: '#fef3c7' },
  never_give_up: { color: '#1B7340', bgColor: '#dcfce7' },
  multilingual: { color: '#4338CA', bgColor: '#e0e7ff' },
  explorer: { color: '#D97706', bgColor: '#fef3c7' },
  creative_soul: { color: '#DB2777', bgColor: '#fce7f3' },
  active_learner: { color: '#DC2626', bgColor: '#fee2e2' },
  century_club: { color: '#7C3AED', bgColor: '#ede9fe' },
  on_fire: { color: '#DC2626', bgColor: '#fee2e2' },
  learnova_legend: { color: '#D97706', bgColor: '#fef3c7' },
};

export function getAchievementStyle(id: string): { color: string; bgColor: string } {
  if (ACHIEVEMENT_STYLES[id]) return ACHIEVEMENT_STYLES[id];
  return { color: '#1B7340', bgColor: '#dcfce7' };
}

function definitionToAchievement(def: AchievementDefinition): Achievement {
  const style = getAchievementStyle(def.id);
  const requirementType =
    'requirement' in def && def.requirement
      ? def.requirement.type === 'lessonsCompleted'
        ? 'lessons'
        : def.requirement.type === 'bestQuizScore'
          ? 'quiz_score'
          : def.requirement.type
      : 'lessons';
  const requirementValue =
    'requirement' in def && def.requirement ? def.requirement.value : 1;
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
    color: style.color,
    bgColor: style.bgColor,
    requirement: {
      type: requirementType as Achievement['requirement']['type'],
      value: requirementValue,
    },
  };
}

export function checkNewAchievements(
  stats: AchievementStats,
  alreadyUnlocked: string[]
): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => {
    if (alreadyUnlocked.includes(a.id)) return false;
    return checkAchievementThreshold(a.id, stats);
  }).map(definitionToAchievement);
}

export function getAchievementProgress(
  achievement: AchievementDefinition,
  stats: AchievementStats
): { current: number; required: number } {
  const id = achievement.id;

  if (id === 'early_bird' || id === 'night_owl') {
    return { current: stats.lessonsCompleted >= 1 ? 1 : 0, required: 1 };
  }
  if (id === 'weekend_warrior') {
    return { current: stats.weekendLessons ?? 0, required: 2 };
  }
  if (id === 'english_expert') {
    return {
      current: stats.subjectLessons?.['English Studies'] ?? 0,
      required: 10,
    };
  }
  if (id === 'maths_master') {
    return {
      current: stats.subjectLessons?.['Mathematics'] ?? 0,
      required: 10,
    };
  }
  if (id === 'science_star') {
    return {
      current: stats.subjectLessons?.['Basic Science'] ?? 0,
      required: 10,
    };
  }
  if (id === 'naija_proud') {
    return {
      current: stats.subjectLessons?.['Nigerian History'] ?? 0,
      required: 1,
    };
  }
  if (id === 'sharp_shooter') {
    return {
      current: stats.consecutivePerfectQuizzes ?? 0,
      required: 3,
    };
  }
  if (id === 'speed_demon') {
    const fastest = stats.fastestQuizSeconds;
    return {
      current: fastest !== null && fastest !== undefined && fastest <= 60 ? 1 : 0,
      required: 1,
    };
  }
  if (id === 'never_give_up') {
    return { current: stats.retriedAndPassedQuiz ? 1 : 0, required: 1 };
  }
  if (id === 'multilingual') {
    return { current: stats.nonEnglishLessons ?? 0, required: 1 };
  }
  if (id === 'explorer') {
    return { current: stats.uniqueSubjectsTried ?? 0, required: 10 };
  }
  if (id === 'creative_soul') {
    return {
      current: stats.subjectLessons?.['Cultural & Creative Arts'] ?? 0,
      required: 1,
    };
  }
  if (id === 'active_learner') {
    return { current: stats.todaysLessons ?? 0, required: 3 };
  }
  if (id === 'century_club') {
    return { current: stats.lessonsCompleted, required: 100 };
  }
  if (id === 'on_fire') {
    return { current: stats.streak, required: 14 };
  }
  if (id === 'learnova_legend') {
    return {
      current: stats.unlockedAchievements?.length ?? 0,
      required: ACHIEVEMENT_DEFINITIONS.length - 1,
    };
  }

  if (id.startsWith('xp_')) {
    const req = parseInt(id.replace('xp_', ''), 10);
    return { current: stats.xp, required: req };
  }
  if (id.startsWith('streak_')) {
    const req = parseInt(id.replace('streak_', ''), 10);
    return { current: stats.streak, required: req };
  }
  if (id.includes('lesson') || id.includes('scholar')) {
    const map: Record<string, number> = {
      first_lesson: 1,
      five_lessons: 5,
      ten_lessons: 10,
    };
    return {
      current: stats.lessonsCompleted,
      required: map[id] ?? 1,
    };
  }
  if (id.includes('quiz')) {
    return {
      current: stats.bestQuizScore,
      required: id === 'perfect_quiz' ? 100 : 1,
    };
  }
  return { current: 0, required: 1 };
}

export const CATEGORY_LABELS: Record<string, string> = {
  streak: '🔥 Streaks',
  lessons: '📚 Lessons',
  quiz: '🎯 Quiz',
  xp: '⚡ XP',
  consistency: '📅 Consistency',
  mastery: '🏆 Subject Mastery',
  exploration: '🌍 Exploration',
  milestone: '💯 Milestones',
};

export function groupAchievementsByCategory() {
  const groups: Record<string, AchievementDefinition[]> = {};
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    const cat = def.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(def);
  }
  return groups;
}
