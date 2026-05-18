/**
 * Achievements screen — view locked and unlocked achievements.
 */
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { ACHIEVEMENTS, getLevel } from '@/constants/achievements';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';

export default function AchievementsScreen() {
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const level = getLevel(xp);

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere pointerEvents="none" />
      <View style={styles.content}>
        <GlassCard style={styles.header}>
          <Text style={styles.headerTitle}>🏆 Achievements</Text>
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⚡ {xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Lv {level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </GlassCard>

        <FlatList
          data={ACHIEVEMENTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isUnlocked = unlockedAchievements.includes(item.id);
            return (
              <GlassCard
                style={[
                  styles.card,
                  !isUnlocked && styles.cardLocked,
                  isUnlocked && { borderColor: item.color, backgroundColor: item.bgColor },
                ]}
              >
                <View style={[styles.emojiCircle, { backgroundColor: isUnlocked ? item.bgColor : '#f3f4f6' }]}>
                  <Text style={[styles.emoji, !isUnlocked && styles.emojiLocked]}>{item.emoji}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.name, isUnlocked && { color: item.color }, !isUnlocked && styles.textLocked]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.description, !isUnlocked && styles.textLocked]}>
                    {item.description}
                  </Text>
                </View>
                {isUnlocked ? (
                  <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.checkText}>✓</Text>
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
  safe: { flex: 1, backgroundColor: COLORS.background },
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
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '900', fontFamily: 'Poppins-Bold', color: COLORS.primaryDark },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
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
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.5)',
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
  name: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold', color: COLORS.textPrimary },
  description: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  textLocked: { color: COLORS.textMuted },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: COLORS.white, fontWeight: '900', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.md },
  lockBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: { fontSize: 18, opacity: 0.6 },
});
