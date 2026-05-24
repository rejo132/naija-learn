/**
 * Subject dashboard — browse and open lessons (`/dashboard`).
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Animated,
  AppState,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { type Language } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import {
  getCoreSubjectsForGrade,
  LANGUAGE_SUBJECTS,
  SOFT_SKILLS,
  Subject,
  getLocalizedSubject,
  findSubjectByLabel,
} from '@/constants/subjects';
import {
  getCurrentLevel,
  getNextLevel,
  getXPProgress,
  getSubjectStars,
} from '@/constants/levels';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Atmosphere } from '@/components/Atmosphere';
import { PressableScale } from '@/components/PressableScale';
import StreakCelebration from '@/components/StreakCelebration';
import { playSound } from '@/services/soundService';
import { toTitleCase } from '@/utils/format';

const LANG_NATIVE: Record<string, string> = {
  en: 'English',
  ha: 'Hausa',
  yo: 'Yorùbá',
  ig: 'Igbo',
};

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
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const {
    selectedLanguage,
    selectedGrade,
    setSubject,
    setLanguage,
    xp,
    streak,
    lastStudyDate,
  } = useAppStore();
  const dailyChallengeCompleted = useAppStore((s) => s.dailyChallengeCompleted);
  const dailyChallengeSubject = useAppStore((s) => s.dailyChallengeSubject);
  const dailyChallengeTopic = useAppStore((s) => s.dailyChallengeTopic);
  const subjectLessonsCount = useAppStore((s) => s.subjectLessonsCount);
  const userGrade = useAppStore((s) => s.userGrade);
  const lastCelebratedStreak = useAppStore((s) => s.lastCelebratedStreak);
  const markStreakCelebrated = useAppStore((s) => s.markStreakCelebrated);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const selectedPersonalityId = useAppStore((s) => s.selectedPersonalityId);
  const lastSubject = useAppStore((s) => s.lastSubject);
  const lastSubjectEmoji = useAppStore((s) => s.lastSubjectEmoji);
  const lastGrade = useAppStore((s) => s.lastGrade);
  const lastOpenedAt = useAppStore((s) => s.lastOpenedAt);
  const subjectProgress = useAppStore((s) => s.subjectProgress);
  const userName = useAppStore((s) => s.userName);
  const userAvatar = useAppStore((s) => s.userAvatar);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;
  const isMedium = width > 900 && width <= 1200;
  const { colors } = useTheme();

  const greeting = getTimeGreeting(t);
  const displayName =
    userName ||
    (user?.user_metadata?.name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Student';
  const studiedToday = isStudiedToday(lastStudyDate);
  const missionProgress = studiedToday ? 100 : 0;
  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const levelProgress = getXPProgress(xp);

  useEffect(() => {
    const store = useAppStore.getState();
    store.generateDailyChallenge();
    const after = useAppStore.getState();
    if (!after.dailyChallengeSubject || !after.dailyChallengeTopic) {
      useAppStore.setState({
        dailyChallengeSubject: after.dailyChallengeSubject || 'Mathematics',
        dailyChallengeTopic: after.dailyChallengeTopic || 'Key Concepts',
      });
    }
  }, []);

  useEffect(() => {
    const milestones = [3, 7, 14, 30];
    if (milestones.includes(streak) && lastCelebratedStreak !== streak) {
      playSound('streak');
      setShowStreakCelebration(true);
    }
  }, [streak, lastCelebratedStreak]);

  const showLevelShimmer = levelProgress >= 80 && levelProgress < 100;

  useEffect(() => {
    if (!showLevelShimmer) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showLevelShimmer, shimmerAnim]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        useAppStore.getState().loadUserProgress().catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  const effectiveGrade =
    selectedGrade ??
    (() => {
      const n = parseInt((userGrade || 'Primary 3').replace(/\D/g, ''), 10);
      return n >= 1 && n <= 6 ? n : 3;
    })();

  const tabContent: Record<Tab, Subject[]> = useMemo(
    () => ({
      subjects: getCoreSubjectsForGrade(effectiveGrade),
      languages: LANGUAGE_SUBJECTS,
      softskills: SOFT_SKILLS,
    }),
    [effectiveGrade]
  );

  const displayGrade =
    userGrade?.trim() ||
    (effectiveGrade ? `Primary ${effectiveGrade}` : 'Primary 3');

  function handleSubject(subject: Subject) {
    playSound('tap');
    setSubject(subject);
    router.push('/lesson');
  }

  function handleStartChallenge() {
    playSound('tap');
    const match = findSubjectByLabel(dailyChallengeSubject);
    if (match) {
      setSubject(getLocalizedSubject(match, selectedLanguage));
    }
    router.push({
      pathname: '/lesson',
      params: {
        subject: dailyChallengeSubject,
        topic: dailyChallengeTopic,
        isChallenge: 'true',
      },
    });
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
              <Text
                style={[styles.greetingName, { color: colors.textPrimary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {userAvatar} Hello, {toTitleCase(displayName)}!
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
                <Text style={[styles.gradePillText, { color: colors.primaryDark }]}>
                  {displayGrade.startsWith('Primary')
                    ? displayGrade
                    : `Primary ${effectiveGrade}`}
                </Text>
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
                <Text
                  style={[
                    styles.langPillText,
                    { color: colors.primary, fontFamily: 'Poppins-SemiBold' },
                  ]}
                >
                  {LANG_NATIVE[selectedLanguage] ?? 'English'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {lastSubject ? (
            <TouchableOpacity
              style={[
                styles.resumeCard,
                {
                  backgroundColor: colors.backgroundCard,
                  borderColor: colors.primaryGlow,
                  borderLeftColor: colors.primary,
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
                <Text style={[styles.resumeLabel, { color: colors.primary }]}>
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
                            `${lastSubject}_${lastGrade ?? effectiveGrade}`
                          ] ?? 0
                        }%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.resumeProgress, { color: colors.textMuted }]}>
                  {subjectProgress[
                    `${lastSubject}_${lastGrade ?? effectiveGrade}`
                  ] ?? 0}
                  % complete
                </Text>
              </View>

              <View style={[styles.resumeArrow, { backgroundColor: colors.primary }]}>
                <Text style={styles.resumeArrowText}>▶ Continue</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: colors.primaryLight,
                borderRadius: RADIUS.xl,
                padding: SPACING.lg,
                marginBottom: SPACING.md,
                alignItems: 'center',
                gap: SPACING.sm,
              }}
            >
              <Text style={{ fontSize: 32 }}>👋</Text>
              <Text
                style={{
                  fontSize: FONT_SIZES.lg,
                  fontFamily: 'Poppins-Bold',
                  color: colors.primaryDark,
                  textAlign: 'center',
                }}
              >
                Ready to start learning?
              </Text>
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  fontFamily: 'Poppins-Regular',
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                Pick a subject below and your AI tutor will guide you! 🚀
              </Text>
            </View>
          )}

          <View
            style={[
              styles.levelCard,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.levelCardHeader}>
              <Text style={[styles.levelCardTitle, { color: colors.textPrimary }]}>
                {currentLevel.emoji} {currentLevel.title}
              </Text>
              <Text style={[styles.levelCardLevel, { color: colors.textMuted }]}>
                Level {currentLevel.level}
              </Text>
            </View>
            <View style={[styles.levelBarBg, { backgroundColor: colors.primaryLight }]}>
              <Animated.View
                style={[
                  styles.levelBarFill,
                  {
                    width: `${levelProgress}%`,
                    backgroundColor: colors.primary,
                    opacity: showLevelShimmer
                      ? shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.85, 1],
                        })
                      : 1,
                  },
                ]}
              />
            </View>
            <Text style={[styles.levelXpText, { color: colors.textSecondary }]}>
              {nextLevel
                ? `${xp} / ${nextLevel.minXP} XP`
                : `${xp} XP`}
            </Text>
            <Text style={[styles.levelNextText, { color: colors.textMuted }]}>
              {nextLevel
                ? `Next: ${nextLevel.title}`
                : 'Max Level Reached! 🌟'}
            </Text>
          </View>

          <View
            style={{
                backgroundColor: colors.backgroundCard,
                borderRadius: RADIUS.xl,
                padding: SPACING.lg,
                marginBottom: SPACING.md,
                borderWidth: 1.5,
                borderColor: colors.primary + '30',
              }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: SPACING.sm,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 20 }}>⚡</Text>
                <Text
                  style={{
                    fontSize: FONT_SIZES.md,
                    fontFamily: 'Poppins-Bold',
                    color: colors.textPrimary,
                  }}
                >
                  Daily Challenge
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: FONT_SIZES.xs,
                    fontFamily: 'Poppins-Bold',
                    color: '#FFFFFF',
                  }}
                >
                  3x XP
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                fontFamily: 'Poppins-Regular',
                color: colors.textMuted,
                marginBottom: 4,
              }}
            >
              🎯 Complete 1 lesson today
            </Text>

            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                fontFamily: 'Poppins-SemiBold',
                color: colors.textPrimary,
                marginBottom: SPACING.md,
              }}
            >
              {dailyChallengeSubject} • {dailyChallengeTopic}
            </Text>

            <View
              style={{
                height: 5,
                backgroundColor: colors.border,
                borderRadius: 3,
                marginBottom: SPACING.sm,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 5,
                  width: dailyChallengeCompleted ? '100%' : `${missionProgress}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 3,
                }}
              />
            </View>

            {dailyChallengeCompleted ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 16 }}>✅</Text>
                <Text
                  style={{
                    fontSize: FONT_SIZES.sm,
                    fontFamily: 'Poppins-SemiBold',
                    color: '#2E9E5A',
                  }}
                >
                  Completed! Come back tomorrow 🌟
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: RADIUS.lg,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                onPress={handleStartChallenge}
              >
                <Text
                  style={{
                    fontSize: FONT_SIZES.sm,
                    fontFamily: 'Poppins-Bold',
                    color: '#FFFFFF',
                  }}
                >
                  Start Challenge ⚡
                </Text>
              </TouchableOpacity>
            )}
          </View>

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

          <View style={styles.grid}>
            {tabContent[activeTab].map((subject) => {
              const localized = getLocalizedSubject(subject, selectedLanguage);
              const cardKey = `${subject.label}_${effectiveGrade}`;
              const cardProgress = subjectProgress[cardKey] ?? 0;
              const stars = getSubjectStars(
                subjectLessonsCount[localized.label] ?? subjectLessonsCount[subject.label] ?? 0
              );
              const starDisplay = Array.from({ length: 5 }, (_, i) =>
                i < stars ? '★' : '☆'
              ).join('');
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
                        <View
                          style={[
                            styles.cardStarsWrap,
                            stars === 5 && styles.cardStarsGlow,
                          ]}
                        >
                          <View style={styles.cardStars}>
                            {starDisplay.split('').map((char, i) => (
                              <Text
                                key={i}
                                style={{
                                  color:
                                    char === '★' ? '#F5A623' : colors.textMuted,
                                  fontSize: 14,
                                  marginRight: i < 4 ? 2 : 0,
                                }}
                              >
                                {char}
                              </Text>
                            ))}
                          </View>
                        </View>
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
        </View>
        </ScrollView>

        {showStreakCelebration && (
          <StreakCelebration
            streak={streak}
            onDismiss={() => {
              setShowStreakCelebration(false);
              markStreakCelebrated(streak);
            }}
          />
        )}
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
  levelCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  levelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  levelCardTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  levelCardLevel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  levelBarBg: {
    height: 10,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundCard,
    marginBottom: SPACING.xs,
  },
  levelBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  levelXpText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  levelNextText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
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

  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryGlow,
    borderLeftWidth: 4,
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
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
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
    minHeight: 44,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resumeArrowText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
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
  cardStarsWrap: {
    marginTop: 4,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  cardStarsGlow: {
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardStars: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
