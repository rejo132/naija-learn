/**
 * Achievements screen — view locked and unlocked achievements.
 */
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { ACHIEVEMENTS, getLevel } from '@/constants/achievements';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';

export default function AchievementsScreen() {
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const level = getLevel(xp);
  const { colors, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}>
      <Atmosphere pointerEvents="none" />
      <View style={styles.content}>
        <GlassCard style={[styles.header, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>🏆 Achievements</Text>
        </GlassCard>

        <GlassCard style={[styles.statsCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>⚡ {xp}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total XP</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>Lv {level}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Level</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>🔥 {streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
        </GlassCard>

        <FlatList
          data={ACHIEVEMENTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
          renderItem={({ item }) => {
            const isUnlocked = unlockedAchievements.includes(item.id);
            return (
              <GlassCard
                style={[
                  styles.card,
                  !isUnlocked && [styles.cardLocked, { borderColor: colors.border, backgroundColor: colors.backgroundGlass }],
                  isUnlocked && { borderColor: item.color, backgroundColor: item.bgColor },
                  isDarkMode && !isUnlocked && { backgroundColor: colors.backgroundCard },
                ]}
              >
                <View style={[styles.emojiCircle, { backgroundColor: isUnlocked ? item.bgColor : colors.backgroundDeep }]}>
                  <Text style={[styles.emoji, !isUnlocked && styles.emojiLocked]}>{item.emoji}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.name, isUnlocked && { color: item.color }, !isUnlocked && { color: colors.textMuted }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.description, !isUnlocked && { color: colors.textMuted }, isUnlocked && { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
                {isUnlocked ? (
                  <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
                    <Text style={[styles.checkText, { color: colors.white }]}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockText}>🔒</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '900', fontFamily: 'Poppins-Bold' },
  statLabel: { fontSize: FONT_SIZES.xs, marginTop: 2, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  statDivider: { width: 1, height: 36 },
  list: { gap: SPACING.md, paddingBottom: SPACING.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 2,
  },
  cardLocked: {
    opacity: 0.65,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  emojiLocked: { opacity: 0.4 },
  cardBody: { flex: 1 },
  name: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  description: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontWeight: '900', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.md },
  lockBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: { fontSize: 18, opacity: 0.6 },
});
