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
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '@/constants/theme';
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

  function handleSelectGrade(grade: number) {
    setGrade(grade);
    router.push('/dashboard');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/', params: { change: '1' } })}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{ui.appName}</Text>
          <Text style={styles.headerSub}>{lang.nativeLabel} · {ui.selectClass}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, isWide && styles.contentWide]}>
          <Image
            source={require('../assets/images/onboarding1.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <GlassCard style={styles.heroCard}>
            <Text style={styles.title}>{ui.classQuestion}</Text>
            <Text style={styles.subtitle}>{ui.classSubtitle}</Text>
          </GlassCard>

          <View style={styles.gradeGrid}>
            {GRADES.map((g) => {
              const isSelected = selectedGrade === g;
              return (
                <View key={g} style={isCompact ? styles.gradeWrapCompact : styles.gradeWrap}>
                  <PressableScale
                    style={[
                      styles.gradeCard,
                      isSelected && styles.gradeCardSelected,
                    ]}
                    onPress={() => handleSelectGrade(g)}
                    scaleTo={0.98}
                  >
                    <Text
                      style={[
                        styles.gradeNumber,
                        isSelected && styles.gradeNumberSelected,
                      ]}
                    >
                      {g}
                    </Text>
                    <Text
                      style={[
                        styles.gradeLabel,
                        isSelected && styles.gradeLabelSelected,
                      ]}
                    >
                      {ui.primary} {g}
                    </Text>
                    <Text
                      style={[
                        styles.gradeAge,
                        isSelected && styles.gradeAgeSelected,
                      ]}
                    >
                      {GRADE_AGES[g]}
                    </Text>
                  </PressableScale>
                </View>
              );
            })}
          </View>

          <GlassCard style={styles.gradingCard}>
            <PressableScale
              style={styles.gradingToggle}
              onPress={() => setShowGrading((v) => !v)}
              scaleTo={0.99}
            >
              <Text style={styles.gradingToggleText}>
                View Grade Scale {showGrading ? '▲' : '▼'}
              </Text>
            </PressableScale>
            {showGrading ? (
              <View style={styles.gradingBody}>
                <Text style={styles.gradingTitle}>Nigerian Grading System (NERDC)</Text>
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
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    zIndex: 2,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.primaryDark, fontFamily: 'Poppins-Bold' },
  headerTitle: {
    color: COLORS.textPrimary,
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.lg,
  },
  headerSub: {
    color: COLORS.textSecondary,
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  gradeCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    ...SHADOWS.medium,
  },
  gradeNumber: {
    fontSize: FONT_SIZES.display,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primaryDark,
    lineHeight: 52,
  },
  gradeNumberSelected: {
    color: COLORS.white,
  },
  gradeLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  gradeLabelSelected: {
    color: COLORS.white,
  },
  gradeAge: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  gradeAgeSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
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
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  gradingBody: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  gradingTitle: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
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
