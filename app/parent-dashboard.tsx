/**
 * Parent dashboard screen.
 * Shows progress summary for all children.
 */
import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getChildren,
  getWeeklySummary,
  getChildProgressHistory,
  Child,
} from '@/services/dbService';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';

type ProgressHistoryEntry = Awaited<ReturnType<typeof getChildProgressHistory>>[number];

export default function ParentDashboardScreen() {
  const { colors, isDarkMode } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [children, setChildren] = useState<Child[]>([]);
  const [summaries, setSummaries] = useState<Record<string, Awaited<ReturnType<typeof getWeeklySummary>>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [progressHistory, setProgressHistory] = useState<ProgressHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (children.length > 0 && user) {
      loadChildHistory(children[0]);
    } else if (user && children.length === 0 && !isLoading) {
      getChildProgressHistory(user.id, user.id).then(setProgressHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, isLoading]);

  async function loadData() {
    setIsLoading(true);
    const kids = await getChildren();
    setChildren(kids);

    if (kids.length > 0) {
      setSelectedChild(kids[0]);
      const summaryMap: typeof summaries = {};
      await Promise.all(
        kids.map(async (kid) => {
          summaryMap[kid.id] = await getWeeklySummary(kid.id, user?.id);
        })
      );
      setSummaries(summaryMap);
    } else if (user) {
      const ownSummary = await getWeeklySummary(user.id, user.id);
      setSummaries({ [user.id]: ownSummary });
    }
    setIsLoading(false);
  }

  async function loadChildHistory(child: Child) {
    setIsLoadingHistory(true);
    const history = await getChildProgressHistory(child.id, user?.id);
    setProgressHistory(history);
    setIsLoadingHistory(false);
  }

  const summary = selectedChild ? summaries[selectedChild.id] : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}>
      <Atmosphere pointerEvents="none" />
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

        {/* Header */}
        <GlassCard style={[styles.header, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.primaryDark }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>📊 Progress Report</Text>
          <TouchableOpacity
            style={[styles.manageBtn, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
            onPress={() => router.push('/children')}
          >
            <Text style={[styles.manageBtnText, { color: colors.primaryDark }]}>Manage</Text>
          </TouchableOpacity>
        </GlassCard>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : children.length === 0 ? (
          <GlassCard style={[styles.emptyCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Your Learning Progress</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add a child profile to track their progress separately,
              or view your own activity below.
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.push('/children')}>
              <Text style={[styles.btnText, { color: colors.white }]}>+ Add Child Profile</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <>
            {/* Child selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childChip,
                    { backgroundColor: colors.backgroundGlass, borderColor: colors.border },
                    selectedChild?.id === child.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setSelectedChild(child);
                    loadChildHistory(child);
                  }}
                >
                  <Text style={styles.childChipEmoji}>{child.avatar}</Text>
                  <Text style={[
                    styles.childChipName,
                    { color: colors.textPrimary },
                    selectedChild?.id === child.id && { color: colors.white },
                  ]}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Summary cards */}
            {selectedChild && summary && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>This Week</Text>
                <View style={styles.statsGrid}>
                  <GlassCard style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
                    <Text style={styles.statEmoji}>📚</Text>
                    <Text style={[styles.statValue, { color: colors.primaryDark }]}>{summary.totalSessions}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lessons</Text>
                  </GlassCard>
                  <GlassCard style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
                    <Text style={styles.statEmoji}>⭐</Text>
                    <Text style={[styles.statValue, { color: colors.primaryDark }]}>{summary.averageScore}%</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Score</Text>
                  </GlassCard>
                  <GlassCard style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
                    <Text style={styles.statEmoji}>⏱️</Text>
                    <Text style={[styles.statValue, { color: colors.primaryDark }]}>{summary.totalMinutes}m</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Study Time</Text>
                  </GlassCard>
                </View>

                {/* Subjects studied */}
                {summary.subjectsStudied.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Subjects Studied</Text>
                    <GlassCard style={[styles.subjectsCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
                      <View style={styles.subjectsList}>
                        {summary.subjectsStudied.map((subject) => (
                          <View key={subject} style={[styles.subjectChip, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
                            <Text style={[styles.subjectChipText, { color: colors.primaryDark }]}>{subject}</Text>
                          </View>
                        ))}
                      </View>
                    </GlassCard>
                  </>
                )}

                {/* Grade banner */}
                <GlassCard style={[
                  styles.gradeCard,
                  {
                    backgroundColor: summary.averageScore >= 70 ? colors.successLight : colors.warningLight,
                    borderColor: colors.border,
                  },
                  isDarkMode && { backgroundColor: colors.backgroundCard },
                ]}>
                  <Text style={styles.gradeEmoji}>
                    {summary.averageScore >= 70 ? '🏆' : '💪'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.gradeTitle, { color: colors.textPrimary }]}>
                      {summary.averageScore >= 70 ? 'Excellent work!' : 'Keep practising!'}
                    </Text>
                    <Text style={[styles.gradeSubtitle, { color: colors.textSecondary }]}>
                      {selectedChild.name} is in Primary {selectedChild.grade}
                    </Text>
                  </View>
                </GlassCard>
              </>
            )}

            {summary && summary.totalSessions === 0 && (
              <GlassCard style={[styles.emptyCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
                <Text style={styles.emptyEmoji}>📖</Text>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No activity yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {selectedChild?.name} hasn't completed any lessons this week
                </Text>
              </GlassCard>
            )}
          </>
        )}

        {!isLoading && progressHistory.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Sessions</Text>
            {isLoadingHistory ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              progressHistory.map((entry) => (
                <GlassCard
                  key={entry.id}
                  style={[styles.historyCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}
                >
                  <View style={styles.historyLeft}>
                    <Text style={[styles.historySubject, { color: colors.textPrimary }]}>{entry.subject}</Text>
                    <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                      {new Date(entry.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    {entry.score !== null && (
                      <View
                        style={[
                          styles.scoreBadge,
                          {
                            backgroundColor:
                              entry.score >= 70 ? COLORS.successLight : COLORS.warningLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.scoreText,
                            { color: entry.score >= 70 ? COLORS.success : COLORS.warning },
                          ]}
                        >
                          {entry.score}%
                        </Text>
                      </View>
                    )}
                    {entry.duration_seconds > 0 && (
                      <Text style={[styles.durationText, { color: colors.textMuted }]}>
                        ⏱ {Math.round(entry.duration_seconds / 60)}m
                      </Text>
                    )}
                  </View>
                </GlassCard>
              ))
            )}
          </>
        )}

        {!isLoading && progressHistory.length === 0 && !isLoadingHistory && (
          <GlassCard style={[styles.noHistoryCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}>
            <Text style={styles.noHistoryEmoji}>📖</Text>
            <Text style={[styles.noHistoryText, { color: colors.textSecondary }]}>
              No lesson history yet. Complete lessons to see progress here!
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginTop: SPACING.sm, marginBottom: SPACING.md, gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl },
  headerTitle: { flex: 1, fontSize: FONT_SIZES.lg, fontWeight: '800' },
  manageBtn: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderWidth: 1,
  },
  manageBtnText: { fontWeight: '700', fontSize: FONT_SIZES.sm },
  childScroll: { marginBottom: SPACING.md },
  childChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginRight: SPACING.sm, borderWidth: 1,
  },
  childChipEmoji: { fontSize: 20 },
  childChipName: { fontWeight: '700', fontSize: FONT_SIZES.sm },
  sectionTitle: {
    fontSize: FONT_SIZES.md, fontWeight: '800',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  statsGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statCard: {
    flex: 1, alignItems: 'center', padding: SPACING.md, gap: 4,
  },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '900' },
  statLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  subjectsCard: { padding: SPACING.md },
  subjectsList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  subjectChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderWidth: 1,
  },
  subjectChipText: { fontWeight: '700', fontSize: FONT_SIZES.sm },
  gradeCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg, gap: SPACING.md,
    marginTop: SPACING.md, borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  gradeEmoji: { fontSize: 36 },
  gradeTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  gradeSubtitle: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xl },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  emptySubtitle: { fontSize: FONT_SIZES.md, textAlign: 'center' },
  btn: {
    borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm,
  },
  btnText: { fontWeight: '800', fontSize: FONT_SIZES.md },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyLeft: { flex: 1 },
  historySubject: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  scoreBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
  },
  durationText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
  },
  noHistoryCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  noHistoryEmoji: { fontSize: 36 },
  noHistoryText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
