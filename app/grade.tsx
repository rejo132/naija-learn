import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, getUIText } from '@/constants/languages';
import { NIGERIAN_GRADES } from '@/constants/subjects';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';

const GRADES = [1, 2, 3, 4, 5, 6];

export default function GradeScreen() {
  const { selectedLanguage, setGrade } = useAppStore();
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;
  const ui = getUIText(selectedLanguage);
  const { width } = useWindowDimensions();
  const isCompact = width < 680;
  const isWide = width > 1200;

  function handleSelectGrade(grade: number) {
    setGrade(grade);
    router.push('/dashboard');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{ui.appName}</Text>
          <Text style={styles.headerSub}>{lang.nativeLabel} · {ui.selectClass}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isWide && styles.contentWide]}>
          <GlassCard style={styles.heroCard}>
            <Text style={styles.title}>{ui.classQuestion}</Text>
            <Text style={styles.subtitle}>{ui.classSubtitle}</Text>
          </GlassCard>

          <View style={styles.gradeGrid}>
            {GRADES.map((g, index) => (
              <Animated.View key={g} entering={FadeInDown.delay(90 + index * 45).duration(260)} style={isCompact ? styles.gradeWrapCompact : styles.gradeWrap}>
                <PressableScale
                  style={[styles.gradeCard, isCompact && styles.gradeCardCompact]}
                  onPress={() => handleSelectGrade(g)}
                >
                  <Text style={styles.gradeNumber}>{g}</Text>
                  <Text style={styles.gradeLabel}>{ui.primary} {g}</Text>
                </PressableScale>
              </Animated.View>
            ))}
          </View>

          <GlassCard style={styles.gradingCard}>
            <Text style={styles.gradingTitle}>Nigerian Grading System (NERDC)</Text>
            <View style={styles.gradingRows}>
              {NIGERIAN_GRADES.map((g) => (
                <View key={g.grade} style={[styles.gradeChip, { backgroundColor: g.bgColor }]}>
                  <Text style={[styles.gradeChipLetter, { color: g.color }]}>{g.grade}</Text>
                  <Text style={[styles.gradeChipRange, { color: g.color }]}>{g.min}–{g.max}%</Text>
                  <Text style={[styles.gradeChipRemark, { color: g.color }]}>{g.remark}</Text>
                </View>
            ))}
          </View>
          </GlassCard>
        </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.primaryDark },
  headerTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONT_SIZES.lg },
  headerSub: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs },
  scroll: { padding: SPACING.xl, alignItems: 'center', paddingBottom: SPACING.xxl },
  content: { width: '100%', maxWidth: 980, zIndex: 2 },
  contentWide: { maxWidth: 1120 },
  heroCard: { borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.xl },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs, textAlign: 'center' },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  gradeWrap: { width: '30%' },
  gradeWrapCompact: { width: '48%' },
  gradeCard: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  gradeCardCompact: {
    minWidth: 130,
  },
  gradeNumber: { fontSize: FONT_SIZES.xxxl, fontWeight: '900', color: COLORS.primaryDark, lineHeight: 40 },
  gradeLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  gradingCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradingTitle: { fontWeight: '700', color: COLORS.textPrimary, fontSize: FONT_SIZES.sm, marginBottom: SPACING.md },
  gradingRows: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  gradeChip: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, alignItems: 'center' },
  gradeChipLetter: { fontWeight: '800', fontSize: FONT_SIZES.lg },
  gradeChipRange: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  gradeChipRemark: { fontSize: FONT_SIZES.xs },
});