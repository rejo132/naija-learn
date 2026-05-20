/**
 * Achievements screen — view locked and unlocked achievements.
 */
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '@/store/appStore';
import {
  ACHIEVEMENT_DEFINITIONS,
  getAchievementStyle,
  getLevel,
  getUnlockedAchievements,
} from '@/constants/achievements';
import { SPACING, RADIUS, FONT_SIZES, FONT_FAMILY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';

export default function AchievementsScreen() {
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const lessonsCompleted = useAppStore((s) => s.lessonsCompleted);
  const bestQuizScore = useAppStore((s) => s.bestQuizScore);
  const level = getLevel(xp);
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const unlocked = getUnlockedAchievements({
    xp,
    streak,
    lessonsCompleted,
    bestQuizScore,
  });
  const unlockedIds = new Set(unlocked.map((a) => a.id));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? colors.background : '#F9F6F0' }]}>
      <Atmosphere pointerEvents="none" />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <GlassCard
            style={[
              styles.header,
              styles.headerCard,
              isDarkMode && { backgroundColor: colors.backgroundCard },
            ]}
          >
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>🏆 {t('achievementsTitle')}</Text>
          </GlassCard>
        </View>

        <GlassCard style={[styles.statsCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>⚡ {xp}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('progressXP')}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>Lv {level}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('levelLabel')}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>🔥 {streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('progressStreak')}</Text>
          </View>
        </GlassCard>

        <Text style={[styles.progressHint, { color: colors.textSecondary }]}>
          {t('achievementsProgress')}
        </Text>

        <FlatList
          data={ACHIEVEMENT_DEFINITIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
          renderItem={({ item }) => {
            const isUnlocked = unlockedIds.has(item.id);
            const style = getAchievementStyle(item.id);
            return (
              <GlassCard
                style={[
                  styles.card,
                  !isUnlocked && [
                    styles.cardLocked,
                    { borderColor: colors.border, backgroundColor: colors.backgroundGlass, opacity: 0.4 },
                  ],
                  isUnlocked && { borderColor: style.color, backgroundColor: style.bgColor, opacity: 1 },
                  isDarkMode && !isUnlocked && { backgroundColor: colors.backgroundCard },
                ]}
              >
                <View style={[styles.emojiCircle, { backgroundColor: isUnlocked ? style.bgColor : colors.backgroundDeep }]}>
                  <Text style={[styles.emoji, !isUnlocked && styles.emojiLocked]}>{item.emoji}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.name, isUnlocked && { color: style.color }, !isUnlocked && { color: colors.textMuted }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.description, !isUnlocked && { color: colors.textMuted }, isUnlocked && { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
                {isUnlocked ? (
                  <View style={[styles.checkBadge, { backgroundColor: style.color }]}>
                    <Text style={[styles.checkText, { color: colors.white }]}>
                      {t('achievementsUnlocked')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.lockBadge}>
                    <Lock size={20} color={colors.textMuted} />
                  </View>
                )}
              </GlassCard>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: SPACING.lg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: { flex: 1, marginTop: 0, marginBottom: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: FONT_FAMILY.bold },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '900', fontFamily: FONT_FAMILY.bold },
  statLabel: { fontSize: FONT_SIZES.xs, marginTop: 2, fontWeight: '600', fontFamily: FONT_FAMILY.semiBold },
  statDivider: { width: 1, height: 36 },
  progressHint: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  list: { gap: SPACING.md, paddingBottom: SPACING.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 2,
  },
  cardLocked: {},
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: FONT_SIZES.xxxl },
  emojiLocked: { opacity: 0.4 },
  cardBody: { flex: 1 },
  name: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: FONT_FAMILY.bold },
  description: { fontSize: FONT_SIZES.sm, marginTop: 2, fontFamily: FONT_FAMILY.regular },
  checkBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontWeight: '700', fontFamily: FONT_FAMILY.semiBold, fontSize: FONT_SIZES.xs },
  lockBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
