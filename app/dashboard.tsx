/**
 * Subject dashboard — browse and open lessons (`/dashboard`).
 */
import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { LANGUAGES, getUIText } from '@/constants/languages';
import {
  getCoreSubjectsForGrade,
  LANGUAGE_SUBJECTS,
  SOFT_SKILLS,
  Subject,
  getLocalizedSubject,
} from '@/constants/subjects';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';

type Tab = 'subjects' | 'languages' | 'softskills';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning!', emoji: '🌅' };
  if (hour < 17) return { text: 'Good afternoon!', emoji: '☀️' };
  return { text: 'Good evening!', emoji: '🌙' };
}

function isStudiedToday(lastStudyDate: string | null) {
  if (!lastStudyDate) return false;
  return lastStudyDate === new Date().toISOString().split('T')[0];
}

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('subjects');
  const { selectedLanguage, selectedGrade, setSubject, xp, streak, lastStudyDate, lessonsCompleted } =
    useAppStore();
  const user = useAuthStore((s) => s.user);
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;
  const ui = getUIText(selectedLanguage);
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;
  const isMedium = width > 900 && width <= 1200;

  const greeting = getTimeGreeting();
  const userName =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split('@')[0] ||
    null;
  const studiedToday = isStudiedToday(lastStudyDate);
  const dailyMissionProgress = studiedToday ? 1 : 0;

  const tabContent: Record<Tab, Subject[]> = useMemo(
    () => ({
      subjects: getCoreSubjectsForGrade(selectedGrade!),
      languages: LANGUAGE_SUBJECTS,
      softskills: SOFT_SKILLS,
    }),
    [selectedGrade]
  );

  if (!selectedGrade) return <Redirect href="/grade" />;

  function handleSubject(subject: Subject) {
    setSubject(subject);
    router.push('/lesson');
  }

  const TABS = [
    { id: 'subjects' as Tab, label: ui.subjects, emoji: '📚' },
    { id: 'languages' as Tab, label: ui.languages, emoji: '🗣️' },
    { id: 'softskills' as Tab, label: ui.lifeSkills, emoji: '🌟' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWide && styles.contentWide, isMedium && styles.contentMedium]}>
          {/* Greeting header */}
          <View style={styles.greetingRow}>
            <View style={styles.greetingTextBlock}>
              <Text style={styles.greetingLine}>
                {greeting.text} {greeting.emoji}
              </Text>
              {userName ? (
                <Text style={styles.greetingName}>Welcome back, {userName}</Text>
              ) : (
                <Text style={styles.greetingSub}>
                  {ui.primary} {selectedGrade} · {lang.nativeLabel}
                </Text>
              )}
            </View>
            <View style={styles.greetingBadges}>
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>🔥 {streak}</Text>
              </View>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>⚡ {xp} XP</Text>
              </View>
            </View>
          </View>

          {/* Nav row */}
          <View style={styles.navRow}>
            <Text style={styles.navTitle}>{ui.appName}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navActions}>
              <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/progress')}>
                <Text style={styles.headerActionBtnText}>📈 Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/achievements')}>
                <Text style={styles.headerActionBtnText}>🏆 Achievements</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/parent-dashboard')}>
                <Text style={styles.headerActionBtnText}>📊 Reports</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/children')}>
                <Text style={styles.headerActionBtnText}>👤 Profiles</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>P{selectedGrade}</Text>
            </View>
          </View>

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <GlassCard variant="elevated" style={styles.statCard}>
              <Text style={styles.statEmoji}>📖</Text>
              <Text style={styles.statValue}>{studiedToday ? 1 : 0}</Text>
              <Text style={styles.statLabel}>Today&apos;s lessons</Text>
            </GlassCard>
            <GlassCard variant="elevated" style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Current streak</Text>
            </GlassCard>
            <GlassCard variant="elevated" style={styles.statCard}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={styles.statValue}>{xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </GlassCard>
          </View>

          {/* Daily mission */}
          <GlassCard variant="glow" style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionTitle}>🎯 Daily Mission</Text>
              <View style={styles.missionXpBadge}>
                <Text style={styles.missionXpText}>+20 XP</Text>
              </View>
            </View>
            <Text style={styles.missionDesc}>Complete 1 lesson today</Text>
            <View style={styles.missionBarBg}>
              <View
                style={[
                  styles.missionBarFill,
                  { width: `${dailyMissionProgress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.missionProgress}>
              {dailyMissionProgress}/1 complete
            </Text>
          </GlassCard>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => (
              <PressableScale
                key={tab.id}
                style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.id)}
                scaleTo={0.97}
              >
                <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                  {tab.emoji} {tab.label}
                </Text>
              </PressableScale>
            ))}
          </View>

          {activeTab === 'softskills' && (
            <GlassCard style={styles.banner}>
              <Text style={styles.bannerTitle}>⭐ {ui.lifeSkillsTitle}</Text>
              <Text style={styles.bannerText}>{ui.lifeSkillsText}</Text>
            </GlassCard>
          )}

          {/* Subject grid */}
          <View style={styles.grid}>
            {tabContent[activeTab].map((subject) => {
              const localized = getLocalizedSubject(subject, selectedLanguage);
              return (
                <View
                  key={subject.id}
                  style={isCompact ? styles.cardWrapCompact : styles.cardWrap}
                >
                  <PressableScale
                    style={styles.subjectCard}
                    onPress={() => handleSubject(localized)}
                    scaleTo={0.98}
                  >
                    <View
                      style={[styles.cardGradient, { backgroundColor: subject.bgColor }]}
                    />
                    <View style={styles.cardInner}>
                      <View style={[styles.cardIcon, { backgroundColor: subject.bgColor }]}>
                        <Text style={styles.cardEmoji}>{subject.icon}</Text>
                      </View>
                      <View style={styles.cardTextBlock}>
                        <Text style={[styles.cardLabel, { color: subject.color }]}>
                          {localized.label}
                        </Text>
                        <Text style={styles.cardGrade}>
                          {ui.primary} {selectedGrade}
                        </Text>
                        <Text style={styles.cardDesc} numberOfLines={2}>
                          {localized.description}
                        </Text>
                      </View>
                      <View style={[styles.cardArrow, { backgroundColor: `${subject.color}18` }]}>
                        <Text style={[styles.cardArrowText, { color: subject.color }]}>→</Text>
                      </View>
                    </View>
                  </PressableScale>
                </View>
              );
            })}
          </View>

          <Text style={styles.lessonsHint}>
            {lessonsCompleted} lessons completed overall
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: SPACING.xxl },
  content: { width: '100%', maxWidth: 980, alignSelf: 'center', paddingHorizontal: SPACING.lg, zIndex: 2 },
  contentWide: { maxWidth: 1180 },
  contentMedium: { maxWidth: 1060 },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  greetingTextBlock: { flex: 1 },
  greetingLine: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  greetingName: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  greetingSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  greetingBadges: { flexDirection: 'row', gap: SPACING.sm, flexShrink: 0 },
  streakBadge: {
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.2)',
  },
  streakBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
    color: COLORS.streakRed,
  },
  xpBadge: {
    backgroundColor: '#FFF8E7',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
  },
  xpBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
    color: COLORS.accentDark,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  navActions: { flex: 1 },
  headerActionBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  headerActionBtnText: {
    color: COLORS.primaryDark,
    fontFamily: 'Poppins-SemiBold',
    fontSize: FONT_SIZES.xs,
  },
  gradeBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradeBadgeText: {
    color: COLORS.primaryDark,
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.sm,
  },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    minWidth: 96,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primaryDark,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  missionCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  missionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  missionXpBadge: {
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
  },
  missionXpText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Bold',
    color: COLORS.accentDark,
  },
  missionDesc: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  missionBarBg: {
    height: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  missionBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  missionProgress: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },

  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  tabLabelActive: { color: COLORS.primaryDark },

  banner: {
    backgroundColor: COLORS.accentLight,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.25)',
  },
  bannerTitle: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.accentDark,
    marginBottom: 6,
    fontSize: FONT_SIZES.sm,
  },
  bannerText: {
    color: '#78350f',
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  cardWrap: { width: '48.5%' },
  cardWrapCompact: { width: '100%' },
  subjectCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    minHeight: 120,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 32 },
  cardTextBlock: { flex: 1 },
  cardLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.lg,
  },
  cardGrade: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardDesc: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  cardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArrowText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
  },
  lessonsHint: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
});
