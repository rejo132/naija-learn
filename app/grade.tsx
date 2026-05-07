import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { LANGUAGES } from '@/constants/languages';
import { NIGERIAN_GRADES } from '@/constants/subjects';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

const GRADES = [1, 2, 3, 4, 5, 6];

export default function GradeScreen() {
  const { selectedLanguage, setGrade } = useAppStore();
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;

  function handleSelectGrade(grade: number) {
    setGrade(grade);
    router.push('/dashboard');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.orbTop} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>NaijaLearn</Text>
          <Text style={styles.headerSub}>{lang.nativeLabel} · Select Your Class</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>What class are you in?</Text>
        <Text style={styles.subtitle}>Select your Nigerian primary school class</Text>

        <View style={styles.gradeGrid}>
          {GRADES.map((g) => (
            <TouchableOpacity key={g} style={styles.gradeCard} onPress={() => handleSelectGrade(g)} activeOpacity={0.8}>
              <Text style={styles.gradeNumber}>{g}</Text>
              <Text style={styles.gradeLabel}>Primary {g}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#041a17' },
  orbTop: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59,130,246,0.18)',
    top: -40,
    right: -30,
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: '#d1fae5' },
  headerTitle: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.lg },
  headerSub: { color: '#bfdbfe', fontSize: FONT_SIZES.xs },
  scroll: { padding: SPACING.xl },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: '#ecfeff', marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: '#bae6fd', marginBottom: SPACING.xl },
  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  gradeCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  gradeNumber: { fontSize: FONT_SIZES.xxxl, fontWeight: '900', color: '#d1fae5' },
  gradeLabel: { fontSize: FONT_SIZES.sm, color: '#e2e8f0', marginTop: 2 },
  gradingCard: {
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  gradingTitle: { fontWeight: '700', color: '#ecfeff', fontSize: FONT_SIZES.sm, marginBottom: SPACING.md },
  gradingRows: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  gradeChip: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, alignItems: 'center' },
  gradeChipLetter: { fontWeight: '800', fontSize: FONT_SIZES.lg },
  gradeChipRange: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  gradeChipRemark: { fontSize: FONT_SIZES.xs },
});