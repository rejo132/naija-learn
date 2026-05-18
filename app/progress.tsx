/**
 * Progress visualization screen.
 * Shows XP, streaks, achievements and learning stats visually.
 */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { ACHIEVEMENTS, getLevel, getXPForNextLevel } from '@/constants/achievements';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';

export default function ProgressScreen() {
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const lessonsCompleted = useAppStore((s) => s.lessonsCompleted);
  const bestQuizScore = useAppStore((s) => s.bestQuizScore);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const { colors, isDarkMode } = useTheme();

  const level = getLevel(xp);
  const xpForNext = getXPForNextLevel(xp);
  const xpProgress = ((xp % 100) / 100) * 100;
  const unlockedCount = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;

  const streakBg =
    streak >= 7
      ? colors.goldLight
      : streak >= 3
        ? colors.errorLight
        : colors.primaryLight;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}>
      <Atmosphere pointerEvents="none" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
      >

        {/* Header */}
        <GlassCard style={[styles.header, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>📈 My Progress</Text>
        </GlassCard>

        {/* Level card */}
        <GlassCard style={[styles.levelCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
          <View style={styles.levelTop}>
            <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.levelNumber, { color: colors.white }]}>Lvl {level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelTitle, { color: colors.textPrimary }]}>Level {level} Learner</Text>
              <Text style={[styles.levelSubtitle, { color: colors.textSecondary }]}>{xpForNext} XP to next level</Text>
            </View>
            <Text style={[styles.xpTotal, { color: colors.goldDark }]}>⚡{xp} XP</Text>
          </View>

          {/* XP Progress bar */}
          <View style={[styles.progressBarBg, { backgroundColor: colors.primaryLight }]}>
            <View style={[styles.progressBarFill, { width: `${xpProgress}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {xp % 100}/100 XP to Level {level + 1}
          </Text>
        </GlassCard>

        {/* Stats grid */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <GlassCard style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </GlassCard>
          <GlassCard style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>{lessonsCompleted}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lessons</Text>
          </GlassCard>
          <GlassCard style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>{bestQuizScore}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Score</Text>
          </GlassCard>
          <GlassCard style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={styles.statEmoji}>🏅</Text>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>{unlockedCount}/{totalAchievements}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Badges</Text>
          </GlassCard>
        </View>

        {/* Streak motivator */}
        <GlassCard style={[
          styles.streakCard,
          { backgroundColor: streakBg, borderColor: colors.border },
          isDarkMode && { backgroundColor: colors.backgroundCard },
        ]}>
          <Text style={styles.streakEmoji}>
            {streak >= 7 ? '⚡' : streak >= 3 ? '🔥' : '🌱'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.streakTitle, { color: colors.textPrimary }]}>
              {streak === 0 ? 'Start your streak today!' :
               streak === 1 ? '1 day streak — keep going!' :
               streak >= 7 ? `${streak} days! You are on fire! 🔥` :
               `${streak} day streak! Don't break it!`}
            </Text>
            <Text style={[styles.streakSubtitle, { color: colors.textSecondary }]}>
              {streak === 0 ? 'Study today to start a streak' :
               'Study every day to keep your streak alive'}
            </Text>
          </View>
        </GlassCard>

        {/* Achievements */}
        <View style={styles.achievementsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Achievements</Text>
          <TouchableOpacity onPress={() => router.push('/achievements')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
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
                  { borderColor: colors.border },
                  isUnlocked
                    ? { backgroundColor: achievement.bgColor, borderColor: achievement.color + '40' }
                    : { opacity: 0.5 },
                  isDarkMode && !isUnlocked && { backgroundColor: colors.backgroundCard },
                ]}
              >
                <Text style={styles.achievementEmoji}>
                  {isUnlocked ? achievement.emoji : '🔒'}
                </Text>
                <Text style={[
                  styles.achievementTitle,
                  isUnlocked ? { color: achievement.color } : { color: colors.textMuted }
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
  safe: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginTop: SPACING.sm, marginBottom: SPACING.md, gap: SPACING.sm,
  },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  levelCard: { padding: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.sm },
  levelTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  levelBadge: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  levelNumber: { fontWeight: '900', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  levelSubtitle: { fontSize: FONT_SIZES.sm },
  xpTotal: { fontSize: FONT_SIZES.md, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  progressBarBg: {
    height: 12,
    borderRadius: 6, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabel: { fontSize: FONT_SIZES.xs, textAlign: 'right' },
  sectionTitle: {
    fontSize: FONT_SIZES.md, fontWeight: '800', fontFamily: 'Poppins-Bold',
    marginBottom: SPACING.sm,
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
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '900', fontFamily: 'Poppins-Bold' },
  statLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  streakCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg, gap: SPACING.md,
    marginVertical: SPACING.sm, borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  streakEmoji: { fontSize: 36 },
  streakTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  streakSubtitle: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  achievementsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: SPACING.md
  },
  seeAll: { fontWeight: '700', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  achievementsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: SPACING.sm, marginBottom: SPACING.xl
  },
  achievementCard: {
    width: '30%', alignItems: 'center',
    padding: SPACING.sm, gap: 4,
    borderWidth: 1,
  },
  achievementEmoji: { fontSize: 28 },
  achievementTitle: {
    fontSize: 10, fontWeight: '700', fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
});
