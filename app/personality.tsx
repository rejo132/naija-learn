/**
 * Personality selection screen.
 * Students choose their AI tutor's teaching style.
 */
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { PERSONALITIES } from '@/constants/personalities';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';

export default function PersonalityScreen() {
  const selectedPersonalityId = useAppStore((s) => s.selectedPersonalityId);
  const setPersonality = useAppStore((s) => s.setPersonality);
  const { colors, isDarkMode } = useTheme();

  function handleSelect(id: string) {
    setPersonality(id);
    router.back();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Atmosphere pointerEvents="none" />
      <View style={styles.content}>
        <GlassCard style={[styles.header, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.primaryDark }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Choose Your Teacher</Text>
        </GlassCard>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Pick the teaching style that helps you learn best
        </Text>

        <FlatList
          data={PERSONALITIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
          renderItem={({ item }) => {
            const isSelected = selectedPersonalityId === item.id;
            return (
              <PressableScale onPress={() => handleSelect(item.id)} scaleTo={0.97}>
                <GlassCard style={[
                  styles.card,
                  { borderColor: isSelected ? item.color : colors.border },
                  isSelected && { backgroundColor: item.bgColor },
                  isDarkMode && !isSelected && { backgroundColor: colors.backgroundCard },
                ]}>
                  <View style={[styles.emojiCircle, { backgroundColor: item.bgColor }]}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.name, { color: item.color }]}>{item.name}</Text>
                    <Text style={[styles.tagline, { color: colors.textSecondary }]}>{item.tagline}</Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
                      <Text style={[styles.checkText, { color: colors.white }]}>✓</Text>
                    </View>
                  )}
                </GlassCard>
              </PressableScale>
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginTop: SPACING.sm, marginBottom: SPACING.sm, gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  subtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center', marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  list: { gap: SPACING.md, paddingBottom: SPACING.xxl },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
    borderWidth: 2,
  },
  emojiCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  cardBody: { flex: 1 },
  name: { fontSize: FONT_SIZES.lg, fontWeight: '800', fontFamily: 'Poppins-Bold' },
  tagline: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  checkBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: { fontWeight: '900', fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.md },
});
