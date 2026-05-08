import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES, getUIText } from '@/constants/languages';
import { NIGERIAN_GRADES } from '@/constants/subjects';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

const GRADES = [1, 2, 3, 4, 5, 6];

export default function GradeScreen() {
  const { selectedLanguage, setGrade } = useAppStore();
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;
  const ui = getUIText(selectedLanguage);

  function handleSelectGrade(grade: number) {
    setGrade(grade);
    router.push('/dashboard');
  }

  return (
    <SafeAreaView style={styles.safe}>
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
        <View style={styles.content}>
          <Text style={styles.title}>{ui.classQuestion}</Text>
          <Text style={styles.subtitle}>{ui.classSubtitle}</Text>

          <View style={styles.gradeGrid}>
            {GRADES.map((g) => (
              <TouchableOpacity key={g} style={styles.gradeCard} onPress={() => handleSelectGrade(g)} activeOpacity={0.8}>
                <Text style={styles.gradeNumber}>{g}</Text>
                <Text style={styles.gradeLabel}>{ui.primary} {g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.gradingCard}>
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
          </View>
        </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.card,
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
  scroll: { padding: SPACING.xl, alignItems: 'center' },
  content: { width: '100%', maxWidth: 900 },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  gradeCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradeNumber: { fontSize: FONT_SIZES.xxxl, fontWeight: '900', color: COLORS.primaryDark },
  gradeLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  gradingCard: {
    backgroundColor: COLORS.card,
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