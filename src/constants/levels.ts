export const XP_LEVELS = [
  { level: 1, title: 'XP Rookie', emoji: '🌱', minXP: 0 },
  { level: 2, title: 'Rising Star', emoji: '⭐', minXP: 50 },
  { level: 3, title: 'Scholar', emoji: '📚', minXP: 150 },
  { level: 4, title: 'Brain Champ', emoji: '🧠', minXP: 300 },
  { level: 5, title: 'Champion', emoji: '🏅', minXP: 500 },
  { level: 6, title: 'Genius', emoji: '💡', minXP: 750 },
  { level: 7, title: 'Naija Legend', emoji: '🦁', minXP: 1000 },
  { level: 8, title: 'Unstoppable', emoji: '🚀', minXP: 1500 },
  { level: 9, title: 'Grand Master', emoji: '👑', minXP: 2000 },
  { level: 10, title: 'Naija Genius', emoji: '🌟', minXP: 3000 },
];

export function getCurrentLevel(xp: number) {
  const level = [...XP_LEVELS].reverse().find((l) => xp >= l.minXP);
  return level ?? XP_LEVELS[0];
}

export function getNextLevel(xp: number) {
  const current = getCurrentLevel(xp);
  return XP_LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function getXPProgress(xp: number) {
  const current = getCurrentLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const earned = xp - current.minXP;
  return Math.round((earned / range) * 100);
}

export function getSubjectStars(lessonsCount: number): number {
  if (lessonsCount >= 10) return 5;
  if (lessonsCount >= 7) return 4;
  if (lessonsCount >= 5) return 3;
  if (lessonsCount >= 3) return 2;
  if (lessonsCount >= 1) return 1;
  return 0;
}
