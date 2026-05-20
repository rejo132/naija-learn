/**
 * Subject dashboard — browse and open lessons (`/dashboard`).
 */
import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { LANGUAGE_NAMES, type Language, getUIText } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import {
  getCoreSubjectsForGrade,
  LANGUAGE_SUBJECTS,
  SOFT_SKILLS,
  Subject,
  getLocalizedSubject,
} from '@/constants/subjects';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { TutorAvatar } from '@/components/TutorAvatar';
import { ChildSwitcher } from '@/components/ChildSwitcher';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { syncProfile } from '@/services/dbService';

type Tab = 'subjects' | 'languages' | 'softskills';

function getTimeGreeting(t: (key: 'goodMorning' | 'goodAfternoon' | 'goodEvening') => string) {
  const hour = new Date().getHours();
  if (hour < 12) return { text: `${t('goodMorning')}!`, emoji: '🌅' };
  if (hour < 17) return { text: `${t('goodAfternoon')}!`, emoji: '☀️' };
  return { text: `${t('goodEvening')}!`, emoji: '🌙' };
}

function isStudiedToday(lastStudyDate: string | null) {
  if (!lastStudyDate) return false;
  return lastStudyDate === new Date().toISOString().split('T')[0];
}

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('subjects');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showSwitcher, setShowSwitcher] = useState(false);
  const { selectedLanguage, selectedGrade, setSubject, setLanguage, xp, streak, lastStudyDate, lessonsCompleted } =
    useAppStore();
  const selectedPersonalityId = useAppStore((s) => s.selectedPersonalityId);
  const lastSubject = useAppStore((s) => s.lastSubject);
  const lastSubjectEmoji = useAppStore((s) => s.lastSubjectEmoji);
  const lastGrade = useAppStore((s) => s.lastGrade);
  const lastOpenedAt = useAppStore((s) => s.lastOpenedAt);
  const subjectProgress = useAppStore((s) => s.subjectProgress);
  const activeChildName = useAppStore((s) => s.activeChildName);
  const activeChildAvatar = useAppStore((s) => s.activeChildAvatar);
  const user = useAuthStore((s) => s.user);
  const ui = getUIText(selectedLanguage);
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;
  const isMedium = width > 900 && width <= 1200;
  const showFloatingTutor = width <= 768;
  const { colors, isDarkMode } = useTheme();
  const { isConnected } = useNetworkStatus();

  const greeting = getTimeGreeting(t);
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

  const lastActiveDate = lastStudyDate;

  useEffect(() => {
    syncProfile({
      xp: xp ?? 0,
      streak: streak ?? 0,
      grade: selectedGrade ?? 1,
      language: selectedLanguage ?? 'en',
      personalityId: selectedPersonalityId ?? 'aunty_naija',
      lastActiveDate: lastActiveDate ?? new Date().toISOString().split('T')[0],
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp, streak, selectedGrade, selectedLanguage, selectedPersonalityId]);

  if (!selectedGrade) return <Redirect href="/grade" />;

  function handleSubject(subject: Subject) {
    setSubject(subject);
    router.push('/lesson');
  }

  function handleAIPromptSubmit() {
    const text = aiPrompt.trim();
    if (!text) return;

    const allSubjects = [
      ...tabContent.subjects,
      ...tabContent.languages,
      ...tabContent.softskills,
    ];
    const lower = text.toLowerCase();
    const match = allSubjects.find(
      (s) =>
        s.label.toLowerCase().includes(lower) ||
        lower.includes(s.label.toLowerCase())
    );

    const subject = match ?? tabContent.subjects[0];
    setAiPrompt('');
    handleSubject(getLocalizedSubject(subject, selectedLanguage));
  }

  const TABS = [
    { id: 'subjects' as Tab, label: t('subjects'), emoji: '📚' },
    { id: 'languages' as Tab, label: t('languages'), emoji: '🗣️' },
    { id: 'softskills' as Tab, label: t('softSkills'), emoji: '🌟' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.safeInner}>
        <Atmosphere />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
        <View style={[styles.content, isWide && styles.contentWide, isMedium && styles.contentMedium]}>
          {/* Greeting header */}
          <View style={styles.greetingRow}>
            <View style={styles.greetingLeft}>
              <Text style={[styles.greetingTime, { color: colors.textMuted }]}>
                {greeting.emoji} {greeting.text}
              </Text>
              <Text style={[styles.greetingName, { color: colors.textPrimary }]}>
                {userName ? `${t('welcomeBack')}, ${userName}` : ui.welcomeToLearnova}
              </Text>
              {streak > 0 && (
                <Text style={[styles.greetingStreak, { color: colors.accent }]}>
                  🔥 {streak} {t('dayStreakLabel')} — keep it up!
                </Text>
              )}
            </View>
            <View style={styles.greetingRight}>
              <View style={[styles.xpPill, { backgroundColor: colors.goldLight, borderColor: 'rgba(234, 162, 33, 0.3)' }]}>
                <Text style={styles.xpPillEmoji}>⚡</Text>
                <Text style={[styles.xpPillText, { color: colors.goldDark }]}>{xp} XP</Text>
              </View>
              <View style={[styles.gradePill, { backgroundColor: colors.primaryLight, borderColor: colors.primaryGlow }]}>
                <Text style={[styles.gradePillText, { color: colors.primaryDark }]}>P{selectedGrade}</Text>
              </View>
              <TouchableOpacity
                style={[styles.langPill, { backgroundColor: colors.accentLight, borderColor: 'rgba(194, 80, 42, 0.2)' }]}
                onPress={() => {
                  const langs: Language[] = ['en', 'ha', 'yo', 'ig'];
                  const current = langs.indexOf(selectedLanguage as Language);
                  const next = langs[(current + 1) % langs.length];
                  setLanguage(next);
                }}
              >
                <Text style={styles.langPillText}>
                  {LANGUAGE_NAMES[selectedLanguage as Language]?.split(' ')[0]}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.switchChildBtn}
                onPress={() => setShowSwitcher(true)}
              >
                <Text style={styles.switchChildAvatar}>
                  {activeChildAvatar ?? '👤'}
                </Text>
                <Text style={styles.switchChildName} numberOfLines={1}>
                  {activeChildName ?? t('selectChild')}
                </Text>
                <Text style={styles.switchChildChevron}>⌄</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Prompt Bar */}
          <View
            style={[
              styles.promptBar,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.border,
              },
            ]}
          >
            <Text style={styles.promptBarIcon}>🤖</Text>
            <TextInput
              style={[
                styles.promptBarInput,
                { color: colors.textPrimary },
                Platform.OS === 'web' && {
                  outlineStyle: 'none' as any,
                  outlineWidth: 0,
                } as any,
              ]}
              value={aiPrompt}
              onChangeText={setAiPrompt}
              placeholder={t('askAI')}
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={handleAIPromptSubmit}
              returnKeyType="go"
            />
            <TouchableOpacity
              style={[
                styles.promptBarBtn,
                { backgroundColor: colors.primary },
                !aiPrompt.trim() && styles.promptBarBtnDisabled,
              ]}
              activeOpacity={0.75}
              onPress={handleAIPromptSubmit}
              disabled={!aiPrompt.trim()}
            >
              <Text style={styles.promptBarBtnText}>{ui.go}</Text>
            </TouchableOpacity>
          </View>

          {!isConnected && (
            <TouchableOpacity
              style={styles.offlineBar}
              onPress={() => router.push({ pathname: '/lesson', params: { offline: '1' } })}
            >
              <Text style={styles.offlineBarText}>
                📴 You are offline — tap to do offline activities
              </Text>
            </TouchableOpacity>
          )}

          {/* Resume last lesson */}
          {lastSubject && (
            <TouchableOpacity
              style={[
                styles.resumeCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderColor: colors.primaryGlow,
                },
              ]}
              onPress={() => {
                const allSubjects = [
                  ...tabContent.subjects,
                  ...tabContent.languages,
                  ...tabContent.softskills,
                ];
                const match = allSubjects.find(
                  (s) => s.label.toLowerCase() === lastSubject.toLowerCase()
                );
                if (match) {
                  handleSubject(getLocalizedSubject(match, selectedLanguage));
                }
              }}
            >
              <View style={[styles.resumeLeft, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.resumeEmoji}>{lastSubjectEmoji ?? '📚'}</Text>
              </View>

              <View style={styles.resumeBody}>
                <Text style={[styles.resumeLabel, { color: colors.textMuted }]}>
                  CONTINUE WHERE YOU LEFT OFF
                </Text>
                <Text style={[styles.resumeSubject, { color: colors.textPrimary }]}>
                  {lastSubject}
                </Text>

                <View style={[styles.resumeProgressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.resumeProgressFill,
                      {
                        width: `${
                          subjectProgress[
                            `${lastSubject}_${lastGrade ?? selectedGrade}`
                          ] ?? 0
                        }%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.resumeProgress, { color: colors.textMuted }]}>
                  {subjectProgress[
                    `${lastSubject}_${lastGrade ?? selectedGrade}`
                  ] ?? 0}
                  % complete
                </Text>
              </View>

              <View style={[styles.resumeArrow, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.resumeArrowText, { color: colors.primary }]}>→</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <GlassCard
              variant="elevated"
              style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}
            >
              <Text style={styles.statEmoji}>📖</Text>
              <Text style={[styles.statValue, { color: colors.primaryDark }]}>{studiedToday ? 1 : 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{ui.todaysLessons}</Text>
            </GlassCard>
            <GlassCard
              variant="elevated"
              style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}
            >
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statValue, { color: colors.primaryDark }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{ui.currentStreak}</Text>
            </GlassCard>
            <GlassCard
              variant="elevated"
              style={[styles.statCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}
            >
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={[styles.statValue, { color: colors.primaryDark }]}>{xp}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('totalXP')}</Text>
            </GlassCard>
          </View>

          {/* Daily mission */}
          <GlassCard
            variant="glow"
            style={[styles.missionCard, isDarkMode && { backgroundColor: colors.backgroundCard }]}
          >
            <View style={styles.missionHeader}>
              <Text style={[styles.missionTitle, { color: colors.textPrimary }]}>🎯 {t('dailyMission')}</Text>
              <View style={[styles.missionXpBadge, { backgroundColor: colors.goldLight, borderColor: 'rgba(234, 162, 33, 0.3)' }]}>
                <Text style={[styles.missionXpText, { color: colors.goldDark }]}>+20 XP</Text>
              </View>
            </View>
            <Text style={[styles.missionDesc, { color: colors.textSecondary }]}>{ui.completeLessonToday}</Text>
            <View style={[styles.missionBarBg, { backgroundColor: colors.primaryLight }]}>
              <View
                style={[
                  styles.missionBarFill,
                  { width: `${dailyMissionProgress * 100}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.missionProgress, { color: colors.textMuted }]}>
              {dailyMissionProgress}/1 {ui.missionComplete}
            </Text>
          </GlassCard>

          <View style={[styles.aiRecommendCard, { backgroundColor: colors.primaryDeep }]}>
            <View style={styles.aiRecommendIcon}>
              <Text style={styles.aiRecommendEmoji}>🤖</Text>
            </View>
            <View style={styles.aiRecommendBody}>
              <Text style={styles.aiRecommendLabel}>{t('aiPickForYou')}</Text>
              <Text style={styles.aiRecommendTitle}>
                {tabContent.subjects[0]?.label ?? 'Mathematics'}
              </Text>
              <Text style={styles.aiRecommendSub}>
                {ui.startDailyLesson}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.aiRecommendBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                const first = tabContent.subjects[0];
                if (first) handleSubject(getLocalizedSubject(first, selectedLanguage));
              }}
            >
              <Text style={styles.aiRecommendBtnText}>{t('startLesson')}</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => (
              <PressableScale
                key={tab.id}
                style={[
                  styles.tabBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.white,
                  },
                  activeTab === tab.id && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setActiveTab(tab.id)}
                scaleTo={0.97}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: colors.textSecondary },
                    activeTab === tab.id && { color: colors.primaryDark },
                  ]}
                >
                  {tab.emoji} {tab.label}
                </Text>
              </PressableScale>
            ))}
          </View>

          {activeTab === 'softskills' && (
            <GlassCard
              style={[
                styles.banner,
                {
                  backgroundColor: colors.accentLight,
                  borderColor: isDarkMode ? colors.border : 'rgba(245, 166, 35, 0.25)',
                },
                isDarkMode && { backgroundColor: colors.backgroundCard },
              ]}
            >
              <Text style={[styles.bannerTitle, { color: colors.accentDark }]}>
                ⭐ {ui.lifeSkillsTitle}
              </Text>
              <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
                {ui.lifeSkillsText}
              </Text>
            </GlassCard>
          )}

          {/* Subject grid */}
          <View style={styles.grid}>
            {tabContent[activeTab].map((subject) => {
              const localized = getLocalizedSubject(subject, selectedLanguage);
              const cardKey = `${subject.label}_${selectedGrade}`;
              const cardProgress = subjectProgress[cardKey] ?? 0;
              return (
                <View
                  key={subject.id}
                  style={isCompact ? styles.cardWrapCompact : styles.cardWrap}
                >
                  <PressableScale
                    style={[styles.subjectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleSubject(localized)}
                    scaleTo={0.98}
                  >
                    <View
                      style={[styles.cardGradient, { backgroundColor: subject.bgColor }]}
                    />
                    {cardProgress > 0 && (
                      <View
                        style={[
                          styles.cardProgressBadge,
                          {
                            backgroundColor:
                              cardProgress >= 100 ? colors.success : colors.primaryLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.cardProgressText,
                            {
                              color:
                                cardProgress >= 100 ? '#FFFFFF' : colors.primaryDark,
                            },
                          ]}
                        >
                          {cardProgress >= 100 ? '✓' : `${cardProgress}%`}
                        </Text>
                      </View>
                    )}
                    <View style={styles.cardInner}>
                      <View style={[styles.cardIcon, { backgroundColor: subject.bgColor }]}>
                        <Text style={styles.cardEmoji}>{subject.icon}</Text>
                      </View>
                      <View style={styles.cardTextBlock}>
                        <Text style={[styles.cardLabel, { color: subject.color }]}>
                          {localized.label}
                        </Text>
                        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
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

          <Text style={[styles.lessonsHint, { color: colors.textMuted }]}>
            {lessonsCompleted} {ui.lessonsCompleted}
          </Text>
        </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.floatingTutor,
            {
              display: showFloatingTutor ? 'flex' : 'none',
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
            },
          ]}
          onPress={() => {
            const first = tabContent.subjects[0];
            if (first) {
              handleSubject(getLocalizedSubject(first, selectedLanguage));
            }
          }}
        >
          <TutorAvatar size={28} />
          <Text style={styles.floatingTutorText}>{ui.askTutor}</Text>
        </TouchableOpacity>

        <ChildSwitcher
          visible={showSwitcher}
          onClose={() => setShowSwitcher(false)}
          onChildSelected={() => {
            setShowSwitcher(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  safeInner: { flex: 1, position: 'relative' },
  scroll: { paddingBottom: SPACING.xxl },
  content: { width: '100%', maxWidth: 980, alignSelf: 'center', paddingHorizontal: SPACING.lg, zIndex: 2 },
  contentWide: { maxWidth: 1180 },
  contentMedium: { maxWidth: 1060 },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  greetingLeft: { flex: 1 },
  greetingTime: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  greetingName: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
    lineHeight: 32,
  },
  greetingStreak: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  greetingRight: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
    flexShrink: 0,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(234, 162, 33, 0.3)',
  },
  xpPillEmoji: { fontSize: 14 },
  xpPillText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
  },
  gradePill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
  },
  gradePillText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
  },
  langPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
  },
  langPillText: {
    fontSize: 16,
  },
  switchChildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
    marginTop: SPACING.sm,
  },
  switchChildAvatar: { fontSize: 16 },
  switchChildName: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primaryDark,
    maxWidth: 80,
  },
  switchChildChevron: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '900',
  },

  promptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  promptBarIcon: { fontSize: 20 },
  promptBarInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    paddingVertical: SPACING.sm,
  },
  promptBarBtn: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  promptBarBtnDisabled: {
    opacity: 0.4,
  },
  promptBarBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.sm,
  },
  offlineBar: {
    backgroundColor: '#FEF6E4',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(234,162,33,0.3)',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  offlineBarText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#B87B0A',
  },

  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryGlow,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  resumeLeft: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resumeEmoji: { fontSize: 24 },
  resumeBody: { flex: 1, gap: 4 },
  resumeLabel: {
    fontSize: 9,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
  },
  resumeSubject: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  resumeProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  resumeProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  resumeProgress: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
  },
  resumeArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resumeArrowText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
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
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
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
  },
  missionXpBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(234, 162, 33, 0.3)',
  },
  missionXpText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Bold',
  },
  missionDesc: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    marginBottom: SPACING.md,
  },
  missionBarBg: {
    height: 10,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  missionBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  missionProgress: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    marginTop: SPACING.xs,
    textAlign: 'right',
  },

  aiRecommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  aiRecommendIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiRecommendEmoji: { fontSize: 22 },
  aiRecommendBody: { flex: 1 },
  aiRecommendLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  aiRecommendTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  aiRecommendSub: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  aiRecommendBtn: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  aiRecommendBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.sm,
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
  },
  tabLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
  },

  banner: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  bannerTitle: {
    fontFamily: 'Poppins-Bold',
    marginBottom: 6,
    fontSize: FONT_SIZES.sm,
  },
  bannerText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  cardWrap: { width: '48.5%' },
  cardWrapCompact: { width: '100%' },
  subjectCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 100,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
  },
  cardProgressBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
    zIndex: 1,
  },
  cardProgressText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
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
  cardDesc: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
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
    marginTop: SPACING.lg,
  },
  floatingTutor: {
    position: 'absolute',
    bottom: 80,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 12,
    zIndex: 100,
  },
  floatingTutorEmoji: { fontSize: 20 },
  floatingTutorText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.sm,
  },
});
