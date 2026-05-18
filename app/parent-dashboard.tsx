/**
 * Parent dashboard screen.
 * Shows progress summary for all children.
 */
import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChildren, getWeeklySummary, Child } from '@/services/dbService';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';

export default function ParentDashboardScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [summaries, setSummaries] = useState<Record<string, Awaited<ReturnType<typeof getWeeklySummary>>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const kids = await getChildren();
    setChildren(kids);
    if (kids.length > 0) {
      setSelectedChild(kids[0]);
      const summaryMap: typeof summaries = {};
      await Promise.all(
        kids.map(async (kid) => {
          summaryMap[kid.id] = await getWeeklySummary(kid.id);
        })
      );
      setSummaries(summaryMap);
    }
    setIsLoading(false);
  }

  const summary = selectedChild ? summaries[selectedChild.id] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere pointerEvents="none" />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <GlassCard style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Progress Report</Text>
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push('/children')}
          >
            <Text style={styles.manageBtnText}>Manage</Text>
          </TouchableOpacity>
        </GlassCard>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : children.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyTitle}>No children yet</Text>
            <Text style={styles.emptySubtitle}>Add a child profile to see their progress</Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.push('/children')}>
              <Text style={styles.btnText}>+ Add Child</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <>
            {/* Child selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.childChip, selectedChild?.id === child.id && styles.childChipSelected]}
                  onPress={() => setSelectedChild(child)}
                >
                  <Text style={styles.childChipEmoji}>{child.avatar}</Text>
                  <Text style={[styles.childChipName, selectedChild?.id === child.id && styles.childChipNameSelected]}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Summary cards */}
            {selectedChild && summary && (
              <>
                <Text style={styles.sectionTitle}>This Week</Text>
                <View style={styles.statsGrid}>
                  <GlassCard style={styles.statCard}>
                    <Text style={styles.statEmoji}>📚</Text>
                    <Text style={styles.statValue}>{summary.totalSessions}</Text>
                    <Text style={styles.statLabel}>Lessons</Text>
                  </GlassCard>
                  <GlassCard style={styles.statCard}>
                    <Text style={styles.statEmoji}>⭐</Text>
                    <Text style={styles.statValue}>{summary.averageScore}%</Text>
                    <Text style={styles.statLabel}>Avg Score</Text>
                  </GlassCard>
                  <GlassCard style={styles.statCard}>
                    <Text style={styles.statEmoji}>⏱️</Text>
                    <Text style={styles.statValue}>{summary.totalMinutes}m</Text>
                    <Text style={styles.statLabel}>Study Time</Text>
                  </GlassCard>
                </View>

                {/* Subjects studied */}
                {summary.subjectsStudied.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Subjects Studied</Text>
                    <GlassCard style={styles.subjectsCard}>
                      <View style={styles.subjectsList}>
                        {summary.subjectsStudied.map((subject) => (
                          <View key={subject} style={styles.subjectChip}>
                            <Text style={styles.subjectChipText}>{subject}</Text>
                          </View>
                        ))}
                      </View>
                    </GlassCard>
                  </>
                )}

                {/* Grade banner */}
                <GlassCard style={[styles.gradeCard, { backgroundColor: summary.averageScore >= 70 ? '#dcfce7' : '#fef9c3' }]}>
                  <Text style={styles.gradeEmoji}>
                    {summary.averageScore >= 70 ? '🏆' : '💪'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gradeTitle}>
                      {summary.averageScore >= 70 ? 'Excellent work!' : 'Keep practising!'}
                    </Text>
                    <Text style={styles.gradeSubtitle}>
                      {selectedChild.name} is in Primary {selectedChild.grade}
                    </Text>
                  </View>
                </GlassCard>
              </>
            )}

            {summary && summary.totalSessions === 0 && (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📖</Text>
                <Text style={styles.emptyTitle}>No activity yet</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedChild?.name} hasn't completed any lessons this week
                </Text>
              </GlassCard>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginTop: SPACING.sm, marginBottom: SPACING.md, gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.primaryDark },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  manageBtn: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderWidth: 1, borderColor: '#bde5cc',
  },
  manageBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: FONT_SIZES.sm },
  childScroll: { marginBottom: SPACING.md },
  childChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  childChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  childChipEmoji: { fontSize: 20 },
  childChipName: { fontWeight: '700', color: COLORS.textPrimary, fontSize: FONT_SIZES.sm },
  childChipNameSelected: { color: COLORS.white },
  sectionTitle: {
    fontSize: FONT_SIZES.md, fontWeight: '800',
    color: COLORS.textPrimary, marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  statsGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statCard: {
    flex: 1, alignItems: 'center', padding: SPACING.md, gap: 4,
  },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '900', color: COLORS.primaryDark },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  subjectsCard: { padding: SPACING.md },
  subjectsList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  subjectChip: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderWidth: 1, borderColor: '#bde5cc',
  },
  subjectChipText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: FONT_SIZES.sm },
  gradeCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg, gap: SPACING.md,
    marginTop: SPACING.md, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
  },
  gradeEmoji: { fontSize: 36 },
  gradeTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  gradeSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xl },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textPrimary },
  emptySubtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm,
  },
  btnText: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.md },
});
