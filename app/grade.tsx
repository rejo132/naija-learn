/**
 * Primary class (grade) selection screen (`/grade`).
 */
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, getUIText } from '@/constants/languages';
import { NIGERIAN_GRADES } from '@/constants/subjects';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';

const GRADES = [1, 2, 3, 4, 5, 6] as const;

const GRADE_AGES: Record<number, string> = {
  1: '(Ages 5–6)',
  2: '(Ages 6–7)',
  3: '(Ages 7–8)',
  4: '(Ages 8–9)',
  5: '(Ages 9–10)',
  6: '(Ages 10–11)',
};

export default function GradeScreen() {
  const { selectedLanguage, selectedGrade, setGrade } = useAppStore();
  const [showGrading, setShowGrading] = useState(false);
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;
  const ui = getUIText(selectedLanguage);
  const { width } = useWindowDimensions();
  const isCompact = width < 680;
  const isWide = width > 1200;
  const { colors, isDarkMode, shadows } = useTheme();

  function handleSelectGrade(grade: number) {
    setGrade(grade);
    router.push('/dashboard');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}>
      <Atmosphere />
      <View style={[
        styles.header,
        {
          backgroundColor: isDarkMode ? colors.backgroundCard : colors.backgroundGlass,
          borderBottomColor: colors.border,
        },
      ]}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/', params: { change: '1' } })}
          style={styles.backBtn}
        >
          <Text style={[styles.backArrow, { color: colors.primaryDark }]}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{ui.appName}</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{lang.nativeLabel} · {ui.selectClass}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWide && styles.contentWide]}>
          <Image
            source={require('../assets/images/onboarding1.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <GlassCard style={[styles.heroCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{ui.classQuestion}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{ui.classSubtitle}</Text>
          </GlassCard>

          <View style={styles.gradeGrid}>
            {GRADES.map((g) => {
              const isSelected = selectedGrade === g;
              return (
                <View key={g} style={isCompact ? styles.gradeWrapCompact : styles.gradeWrap}>
                  <PressableScale
                    style={[
                      styles.gradeCard,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.white,
                        borderColor: isSelected ? colors.primaryDark : colors.primary,
                      },
                      isSelected ? shadows.medium : shadows.soft,
                    ]}
                    onPress={() => handleSelectGrade(g)}
                    scaleTo={0.98}
                  >
                    <Text
                      style={[
                        styles.gradeNumber,
                        { color: colors.primaryDark },
                        isSelected && { color: colors.white },
                      ]}
                    >
                      {g}
                    </Text>
                    <Text
                      style={[
                        styles.gradeLabel,
                        { color: colors.textPrimary },
                        isSelected && { color: colors.white },
                      ]}
                    >
                      {ui.primary} {g}
                    </Text>
                    <Text
                      style={[
                        styles.gradeAge,
                        { color: colors.textSecondary },
                        isSelected && { color: 'rgba(255, 255, 255, 0.85)' },
                      ]}
                    >
                      {GRADE_AGES[g]}
                    </Text>
                  </PressableScale>
                </View>
              );
            })}
          </View>

          <GlassCard style={[styles.gradingCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <PressableScale
              style={styles.gradingToggle}
              onPress={() => setShowGrading((v) => !v)}
              scaleTo={0.99}
            >
              <Text style={[styles.gradingToggleText, { color: colors.primary }]}>
                View Grade Scale {showGrading ? '▲' : '▼'}
              </Text>
            </PressableScale>
            {showGrading ? (
              <View style={[styles.gradingBody, { borderTopColor: colors.border }]}>
                <Text style={[styles.gradingTitle, { color: colors.textPrimary }]}>Nigerian Grading System (NERDC)</Text>
                <View style={styles.gradingRows}>
                  {NIGERIAN_GRADES.map((g) => (
                    <View key={g.grade} style={[styles.gradeChip, { backgroundColor: g.bgColor }]}>
                      <Text style={[styles.gradeChipLetter, { color: g.color }]}>{g.grade}</Text>
                      <Text style={[styles.gradeChipRange, { color: g.color }]}>
                        {g.min}–{g.max}%
                      </Text>
                      <Text style={[styles.gradeChipRemark, { color: g.color }]}>{g.remark}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    zIndex: 2,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, fontFamily: 'Poppins-Bold' },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.lg,
  },
  headerSub: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
  },
  scroll: { padding: SPACING.xl, alignItems: 'center', paddingBottom: SPACING.xxl },
  content: { width: '100%', maxWidth: 980, zIndex: 2 },
  contentWide: { maxWidth: 1120 },
  heroImage: {
    width: '100%',
    height: 200,
    marginBottom: SPACING.lg,
  },
  heroCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  gradeWrap: { width: '48%' },
  gradeWrapCompact: { width: '100%' },
  gradeCard: {
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
  },
  gradeNumber: {
    fontSize: FONT_SIZES.display,
    fontFamily: 'Poppins-Bold',
    lineHeight: 52,
  },
  gradeLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    marginTop: SPACING.xs,
  },
  gradeAge: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  gradingCard: {
    padding: SPACING.lg,
  },
  gradingToggle: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  gradingToggleText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: FONT_SIZES.md,
  },
  gradingBody: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  gradingTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  gradingRows: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  gradeChip: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  gradeChipLetter: {
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.lg,
  },
  gradeChipRange: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  gradeChipRemark: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
  },
});
