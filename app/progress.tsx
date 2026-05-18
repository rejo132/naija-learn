/**
 * Progress visualization screen.
 * Shows XP, streaks, achievements and learning stats visually.
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { ACHIEVEMENTS, getLevel, getXPForNextLevel } from '@/constants/achievements';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';

export default function ProgressScreen() {
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const lessonsCompleted = useAppStore((s) => s.lessonsCompleted);
  const bestQuizScore = useAppStore((s) => s.bestQuizScore);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);

  const level = getLevel(xp);
  const xpForNext = getXPForNextLevel(xp);
  const xpProgress = ((xp % 100) / 100) * 100;
  const unlockedCount = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere pointerEvents="none" />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <GlassCard style={styles.header}>
          <Text style={styles.headerTitle}>📈 My Progress</Text>
        </GlassCard>

        {/* Level card */}
        <GlassCard style={styles.levelCard}>
          <View style={styles.levelTop}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>Lvl {level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {level} Learner</Text>
              <Text style={styles.levelSubtitle}>{xpForNext} XP to next level</Text>
            </View>
            <Text style={styles.xpTotal}>⚡{xp} XP</Text>
          </View>

          {/* XP Progress bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${xpProgress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {xp % 100}/100 XP to Level {level + 1}
          </Text>
        </GlassCard>

        {/* Stats grid */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statValue}>{lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{bestQuizScore}%</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statEmoji}>🏅</Text>
            <Text style={styles.statValue}>{unlockedCount}/{totalAchievements}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </GlassCard>
        </View>

        {/* Streak motivator */}
        <GlassCard style={[styles.streakCard,
          streak >= 7 ? { backgroundColor: COLORS.goldLight } :
          streak >= 3 ? { backgroundColor: '#fee2e2' } :
          { backgroundColor: COLORS.primaryLight }
        ]}>
          <Text style={styles.streakEmoji}>
            {streak >= 7 ? '⚡' : streak >= 3 ? '🔥' : '🌱'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakTitle}>
              {streak === 0 ? 'Start your streak today!' :
               streak === 1 ? '1 day streak — keep going!' :
               streak >= 7 ? `${streak} days! You are on fire! 🔥` :
               `${streak} day streak! Don't break it!`}
            </Text>
            <Text style={styles.streakSubtitle}>
              {streak === 0 ? 'Study today to start a streak' :
               'Study every day to keep your streak alive'}
            </Text>
          </View>
        </GlassCard>

        {/* Achievements */}
        <View style={styles.achievementsHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity onPress={() => router.push('/achievements')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.slice(0, 6).map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            return (
              <GlassCard
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  isUnlocked
                    ? { backgroundColor: achievement.bgColor, borderColor: achievement.color + '40' }
                    : { opacity: 0.5 }
                ]}
              >
                <Text style={styles.achievementEmoji}>
                  {isUnlocked ? achievement.emoji : '🔒'}
                </Text>
                <Text style={[
                  styles.achievementTitle,
                  isUnlocked ? { color: achievement.color } : { color: COLORS.textMuted }
                ]}>
                  {achievement.title}
                </Text>
              </GlassCard>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginTop: SPACING.sm, marginBottom: SPACING.md, gap: SPACING.sm,
  },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary },
  levelCard: { padding: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.sm },
  levelTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  levelBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  levelNumber: { color: COLORS.white, fontWeight: '900', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary },
  levelSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  xpTotal: { fontSize: FONT_SIZES.md, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.goldDark },
  progressBarBg: {
    height: 12, backgroundColor: COLORS.primaryLight,
    borderRadius: 6, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'right' },
  sectionTitle: {
    fontSize: FONT_SIZES.md, fontWeight: '800', fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary, marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: SPACING.sm, marginBottom: SPACING.sm
  },
  statCard: {
    width: '47%', alignItems: 'center',
    padding: SPACING.md, gap: 4,
  },
  statEmoji: { fontSize: 28 },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '900', fontFamily: 'Poppins-Bold', color: COLORS.primaryDark },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  streakCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg, gap: SPACING.md,
    marginVertical: SPACING.sm, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
  },
  streakEmoji: { fontSize: 36 },
  streakTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary },
  streakSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  achievementsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: SPACING.md
  },
  seeAll: { color: COLORS.primary, fontWeight: '700', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  achievementsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: SPACING.sm, marginBottom: SPACING.xl
  },
  achievementCard: {
    width: '30%', alignItems: 'center',
    padding: SPACING.sm, gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  achievementEmoji: { fontSize: 28 },
  achievementTitle: {
    fontSize: 10, fontWeight: '700', fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
});
