/**
 * Swipeable card-based lesson viewer (`/lesson`).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { getLessonFromDB, saveProgress, syncProfile } from '@/services/dbService';
import { playSound } from '@/services/soundService';
import { LANGUAGES, type LanguageCode } from '@/constants/languages';
import {
  type Achievement,
  type AchievementStats,
  checkNewAchievements,
} from '@/constants/achievements';
import { getTopicsForSubject } from '@/constants/subjects';
import { AchievementToast } from '@/components/AchievementToast';
import { MarkdownMessage } from '@/components/MarkdownMessage';
import { PressableScale } from '@/components/PressableScale';
import { goBack } from '@/utils/navigation';

const THEME = {
  primary: '#008751',
  dark: '#005C36',
  light: '#E8F5EE',
  white: '#FFFFFF',
  text: '#0D2B1A',
  muted: '#3D6B52',
  wrong: '#E74C3C',
  correct: '#008751',
};

const XP_PER_CORRECT = 20;
const MAX_QUIZ_CARDS = 5;
const CARD_GAP = 16;
const CARD_RADIUS = 24;

interface QuizQuestion {
  id?: string;
  question_type?: string;
  question: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  explanation?: string;
}

interface DBLesson {
  content: string;
  summary: string;
  learning_objectives: string[];
  nigerian_examples: string[];
  quiz_questions: QuizQuestion[];
}

type CardType =
  | 'topic'
  | 'lesson'
  | 'keyPoints'
  | 'nigerianExamples'
  | 'summary'
  | 'quiz'
  | 'results'
  | 'comingSoon';

interface CardDef {
  type: CardType;
  quizIndex?: number;
  question?: QuizQuestion;
}

function buildCards(lesson: DBLesson | null, notFound: boolean): CardDef[] {
  if (notFound || !lesson) {
    return [{ type: 'comingSoon' }];
  }

  const cards: CardDef[] = [
    { type: 'topic' },
    { type: 'lesson' },
    { type: 'keyPoints' },
    { type: 'nigerianExamples' },
    { type: 'summary' },
  ];

  const questions = (lesson.quiz_questions ?? []).slice(0, MAX_QUIZ_CARDS);
  questions.forEach((q, i) => {
    cards.push({ type: 'quiz', quizIndex: i, question: q });
  });
  cards.push({ type: 'results' });
  return cards;
}

function getQuizOptions(question: QuizQuestion): { key: string; text: string }[] {
  const isTrueFalse =
    question.question_type === 'true_false' ||
    ((!question.option_c?.trim() || !question.option_d?.trim()) &&
      question.option_a?.trim() &&
      question.option_b?.trim() &&
      !question.option_c?.trim() &&
      !question.option_d?.trim());

  if (isTrueFalse) {
    return [
      { key: 'A', text: question.option_a?.trim() || 'True' },
      { key: 'B', text: question.option_b?.trim() || 'False' },
    ];
  }

  return (
    [
      { key: 'A', text: question.option_a ?? '' },
      { key: 'B', text: question.option_b ?? '' },
      { key: 'C', text: question.option_c ?? '' },
      { key: 'D', text: question.option_d ?? '' },
    ] as const
  ).filter((o) => o.text.trim());
}

function normalizeAnswer(value: string): string {
  return value.trim().toUpperCase().charAt(0);
}

export default function LessonScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;

  const params = useLocalSearchParams<{
    subject?: string;
    topic?: string;
    grade?: string;
  }>();

  const storeGrade = useAppStore((s) => s.selectedGrade);
  const storeSubject = useAppStore((s) => s.selectedSubject);
  const selectedLanguage = useAppStore((s) => s.selectedLanguage);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const xp = useAppStore((s) => s.xp);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const addXP = useAppStore((s) => s.addXP);
  const updateStreak = useAppStore((s) => s.updateStreak);
  const updateBestQuizScore = useAppStore((s) => s.updateBestQuizScore);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);
  const incrementLessons = useAppStore((s) => s.incrementLessons);
  const updateSubjectProgress = useAppStore((s) => s.updateSubjectProgress);
  const markFlowCompleted = useAppStore((s) => s.markFlowCompleted);
  const incrementSubjectLesson = useAppStore((s) => s.incrementSubjectLesson);
  const incrementTodaysLessons = useAppStore((s) => s.incrementTodaysLessons);
  const incrementWeekendLessons = useAppStore((s) => s.incrementWeekendLessons);
  const incrementNonEnglishLessons = useAppStore((s) => s.incrementNonEnglishLessons);
  const addUniqueSubject = useAppStore((s) => s.addUniqueSubject);
  const setConsecutivePerfectQuizzes = useAppStore((s) => s.setConsecutivePerfectQuizzes);
  const consecutivePerfectQuizzes = useAppStore((s) => s.consecutivePerfectQuizzes);

  const grade = useMemo(() => {
    const fromParam = parseInt(String(params.grade ?? ''), 10);
    if (fromParam >= 1) return fromParam;
    return storeGrade ?? 0;
  }, [params.grade, storeGrade]);

  const subject = useMemo(() => {
    const fromParam = typeof params.subject === 'string' ? params.subject : '';
    return fromParam.trim() || storeSubject?.label || '';
  }, [params.subject, storeSubject?.label]);

  const topic = useMemo(() => {
    const fromParam = typeof params.topic === 'string' ? params.topic : '';
    if (fromParam.trim()) return fromParam.trim();
    const topics = getTopicsForSubject(subject);
    return topics[0] ?? 'Introduction & Basics';
  }, [params.topic, subject]);

  const [lesson, setLesson] = useState<DBLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [resultsXp, setResultsXp] = useState(0);
  const [resultsTotalXp, setResultsTotalXp] = useState(0);
  const [resultsScore, setResultsScore] = useState({ correct: 0, total: 0 });

  const lessonStartRef = useRef(Date.now());
  const finalizedRef = useRef(false);
  const offsetX = useSharedValue(0);
  const dragStartX = useSharedValue(0);
  const cardStep = cardWidth + CARD_GAP;

  const cards = useMemo(() => buildCards(lesson, notFound), [lesson, notFound]);
  const quizCount = cards.filter((c) => c.type === 'quiz').length;

  const loadLesson = useCallback(async () => {
    if (!grade || !subject || !topic) return;
    setLoading(true);
    setNotFound(false);
    setCurrentIndex(0);
    setAnswers([]);
    finalizedRef.current = false;
    setResultsXp(0);
    setResultsTotalXp(0);
    setResultsScore({ correct: 0, total: 0 });
    offsetX.value = 0;
    lessonStartRef.current = Date.now();

    const data = await getLessonFromDB(grade, subject, topic, selectedLanguage);
    if (!data) {
      setLesson(null);
      setNotFound(true);
    } else {
      setLesson(data as DBLesson);
      setNotFound(false);
      const qLen = Math.min((data.quiz_questions ?? []).length, MAX_QUIZ_CARDS);
      setAnswers(Array(qLen).fill(null));
    }
    setLoading(false);
  }, [grade, subject, topic, selectedLanguage, offsetX]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  const snapToIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      offsetX.value = withSpring(-index * cardStep, { damping: 20, stiffness: 200 });
    },
    [cardStep, offsetX]
  );

  const canAdvanceFrom = useCallback(
    (index: number): boolean => {
      const card = cards[index];
      if (!card) return true;
      if (card.type === 'quiz' && card.quizIndex !== undefined) {
        return answers[card.quizIndex] !== null;
      }
      return true;
    },
    [cards, answers]
  );

  const canNavigateTo = useCallback(
    (targetIndex: number): boolean => {
      if (targetIndex < 0 || targetIndex >= cards.length) return false;
      if (targetIndex <= currentIndex) return true;
      for (let i = currentIndex; i < targetIndex; i++) {
        if (!canAdvanceFrom(i)) return false;
      }
      return true;
    },
    [cards.length, currentIndex, canAdvanceFrom]
  );

  const buildAchievementStats = useCallback(
    (extra?: Partial<AchievementStats>): AchievementStats => {
      const s = useAppStore.getState();
      return {
        xp: s.xp,
        streak: s.streak,
        lessonsCompleted: s.lessonsCompleted,
        bestQuizScore: s.bestQuizScore,
        weekendLessons: s.weekendLessons,
        consecutivePerfectQuizzes: s.consecutivePerfectQuizzes,
        fastestQuizSeconds: s.fastestQuizSeconds,
        retriedAndPassedQuiz: s.retriedAndPassedQuiz,
        nonEnglishLessons: s.nonEnglishLessons,
        uniqueSubjectsTried: s.uniqueSubjectsTried.length,
        todaysLessons: s.todaysLessons,
        subjectLessons: s.subjectLessonsCount,
        unlockedAchievements: s.unlockedAchievements,
        ...extra,
      };
    },
    []
  );

  const finalizeResults = useCallback(() => {
    if (finalizedRef.current || notFound || !lesson) return;
    finalizedRef.current = true;

    const questions = (lesson.quiz_questions ?? []).slice(0, MAX_QUIZ_CARDS);
    const total = questions.length;
    let correct = 0;
    questions.forEach((q, i) => {
      const selected = answers[i];
      if (selected && normalizeAnswer(selected) === normalizeAnswer(q.correct_answer)) {
        correct += 1;
      }
    });

    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 100;
    const xpEarned = correct * XP_PER_CORRECT;

    setResultsScore({ correct, total });
    setResultsXp(xpEarned);

    addXP(xpEarned);
    setResultsTotalXp(useAppStore.getState().xp);
    updateBestQuizScore(scorePercent);
    updateStreak();

    if (scorePercent === 100) {
      setConsecutivePerfectQuizzes(consecutivePerfectQuizzes + 1);
    } else {
      setConsecutivePerfectQuizzes(0);
    }

    incrementLessons();
    if (subject) {
      incrementSubjectLesson(subject);
      updateSubjectProgress(subject, grade, scorePercent);
      markFlowCompleted(subject, grade);
      addUniqueSubject(subject);
    }

    const day = new Date().getDay();
    if (day === 0 || day === 6) incrementWeekendLessons();
    if (selectedLanguage !== 'en') incrementNonEnglishLessons();
    incrementTodaysLessons();

    const newlyUnlocked = checkNewAchievements(
      buildAchievementStats({ bestQuizScore: scorePercent }),
      unlockedAchievements
    );
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((a) => unlockAchievement(a.id));
      setNewAchievement(newlyUnlocked[0]);
    }

    const durationSecs = Math.round((Date.now() - lessonStartRef.current) / 1000);
    saveProgress({
      subject,
      topic,
      score: scorePercent,
      grade,
      xpEarned,
      durationSeconds: durationSecs,
      flowCompleted: true,
      childId: null,
    }).catch((err) => console.error('saveProgress error:', err));

    syncProfile().catch((err) => console.error('syncProfile error:', err));
    playSound('xp');
  }, [
    notFound,
    lesson,
    answers,
    addXP,
    updateBestQuizScore,
    updateStreak,
    setConsecutivePerfectQuizzes,
    consecutivePerfectQuizzes,
    incrementLessons,
    subject,
    grade,
    topic,
    incrementSubjectLesson,
    updateSubjectProgress,
    markFlowCompleted,
    addUniqueSubject,
    incrementWeekendLessons,
    selectedLanguage,
    incrementNonEnglishLessons,
    incrementTodaysLessons,
    buildAchievementStats,
    unlockedAchievements,
    unlockAchievement,
  ]);

  const goToIndex = useCallback(
    (target: number) => {
      if (!canNavigateTo(target)) return;
      snapToIndex(target);
      if (cards[target]?.type === 'results') {
        finalizeResults();
      }
    },
    [canNavigateTo, snapToIndex, cards, finalizeResults]
  );

  const handleIndexFromGesture = useCallback(
    (target: number) => {
      goToIndex(target);
    },
    [goToIndex]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        .onStart(() => {
          dragStartX.value = offsetX.value;
        })
        .onUpdate((e) => {
          offsetX.value = dragStartX.value + e.translationX;
        })
        .onEnd((e) => {
          const projected = -offsetX.value / cardStep;
          let next = Math.round(projected);
          if (e.velocityX < -400) next = Math.ceil(projected);
          if (e.velocityX > 400) next = Math.floor(projected);
          next = Math.max(0, Math.min(cards.length - 1, next));
          runOnJS(handleIndexFromGesture)(next);
        }),
    [cardStep, cards.length, dragStartX, offsetX, handleIndexFromGesture]
  );

  const carouselStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  function handleLanguageChange(lang: LanguageCode) {
    if (lang === selectedLanguage) return;
    setLanguage(lang);
  }

  function handleQuizAnswer(quizIndex: number, choice: string, correctAnswer: string) {
    if (answers[quizIndex] !== null) return;
    const correct = normalizeAnswer(choice) === normalizeAnswer(correctAnswer);
    playSound(correct ? 'correct' : 'wrong');
    setAnswers((prev) => {
      const next = [...prev];
      next[quizIndex] = choice;
      return next;
    });
  }

  function handleNextTopic() {
    const topics = getTopicsForSubject(subject);
    const idx = topics.indexOf(topic);
    const nextTopic =
      idx >= 0 && idx < topics.length - 1 ? topics[idx + 1] : topics[0] ?? topic;
    router.replace({
      pathname: '/lesson',
      params: { subject, topic: nextTopic, grade: String(grade) },
    });
  }

  if (!grade) return <Redirect href="/grade" />;
  if (!subject) return <Redirect href="/dashboard" />;

  function renderCard(card: CardDef, index: number) {
    switch (card.type) {
      case 'comingSoon':
        return (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Lesson</Text>
            <View style={styles.cardBodyCenter}>
              <Text style={styles.comingSoonEmoji}>🚀</Text>
              <Text style={styles.comingSoonText}>Lesson coming soon!</Text>
              <PressableScale
                style={styles.primaryBtn}
                onPress={() => router.replace('/dashboard')}
                scaleTo={0.98}
              >
                <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
              </PressableScale>
            </View>
          </View>
        );

      case 'topic':
        return (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Topic</Text>
            <View style={styles.cardBodyCenter}>
              <Text style={styles.topicSubject}>{subject}</Text>
              <Text style={styles.topicTitle}>{topic}</Text>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>Primary {grade}</Text>
              </View>
              <PressableScale
                style={styles.primaryBtn}
                onPress={() => goToIndex(1)}
                scaleTo={0.98}
              >
                <Text style={styles.primaryBtnText}>Start Lesson</Text>
              </PressableScale>
            </View>
          </View>
        );

      case 'lesson':
        return (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Lesson</Text>
            <ScrollView style={styles.cardScroll} showsVerticalScrollIndicator>
              <MarkdownMessage
                content={lesson?.content ?? ''}
                fontSize={16}
                lineHeight={26}
              />
            </ScrollView>
          </View>
        );

      case 'keyPoints':
        return (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Key Points</Text>
            <ScrollView style={styles.cardScroll} showsVerticalScrollIndicator>
              {(lesson?.learning_objectives ?? []).length > 0 ? (
                (lesson?.learning_objectives ?? []).map((point, i) => (
                  <View key={`${point}-${i}`} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No key points for this lesson yet.</Text>
              )}
            </ScrollView>
          </View>
        );

      case 'nigerianExamples':
        return (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Nigerian Examples</Text>
            <ScrollView style={styles.cardScroll} showsVerticalScrollIndicator>
              {(lesson?.nigerian_examples ?? []).length > 0 ? (
                (lesson?.nigerian_examples ?? []).map((example, i) => (
                  <View key={`${example}-${i}`} style={styles.exampleRow}>
                    <Text style={styles.exampleFlag}>🇳🇬</Text>
                    <Text style={styles.exampleText}>{example}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No examples for this lesson yet.</Text>
              )}
            </ScrollView>
          </View>
        );

      case 'summary':
        return (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Summary</Text>
            <ScrollView style={styles.cardScroll} showsVerticalScrollIndicator>
              <Text style={styles.summaryText}>
                {lesson?.summary?.trim() || 'No summary available yet.'}
              </Text>
            </ScrollView>
          </View>
        );

      case 'quiz': {
        const q = card.question!;
        const qIndex = card.quizIndex ?? 0;
        const selected = answers[qIndex];
        const options = getQuizOptions(q);
        const correctKey = normalizeAnswer(q.correct_answer);

        return (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>
              Quiz · {qIndex + 1} of {quizCount}
            </Text>
            <ScrollView style={styles.cardScroll} showsVerticalScrollIndicator>
              <Text style={styles.quizQuestion}>{q.question}</Text>
              <View style={styles.quizOptions}>
                {options.map((opt) => {
                  const isSelected = selected === opt.key;
                  const showResult = selected !== null;
                  const isCorrect = opt.key === correctKey;
                  let bg = THEME.white;
                  let border = '#DDE8E2';
                  if (showResult && isCorrect) {
                    bg = '#D4EDDA';
                    border = THEME.correct;
                  } else if (showResult && isSelected && !isCorrect) {
                    bg = '#FADBD8';
                    border = THEME.wrong;
                  } else if (isSelected) {
                    border = THEME.primary;
                  }

                  return (
                    <PressableScale
                      key={opt.key}
                      style={[styles.quizOption, { backgroundColor: bg, borderColor: border }]}
                      onPress={
                        selected === null
                          ? () => handleQuizAnswer(qIndex, opt.key, q.correct_answer)
                          : undefined
                      }
                      scaleTo={0.98}
                    >
                      <Text style={styles.quizOptionText}>
                        {opt.key}) {opt.text}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
              {selected !== null && q.explanation ? (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>{q.explanation}</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        );
      }

      case 'results': {
        const { correct, total } = resultsScore;
        const displayTotal = total || quizCount;
        return (
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Results</Text>
            <View style={styles.cardBodyCenter}>
              <Text style={styles.resultsEmoji}>
                {correct === displayTotal && displayTotal > 0 ? '🎉' : '💪'}
              </Text>
              <Text style={styles.resultsScore}>
                {correct}/{displayTotal || MAX_QUIZ_CARDS}
              </Text>
              <Text style={styles.resultsSub}>correct answers</Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+{resultsXp} XP earned</Text>
              </View>
              <Text style={styles.totalXp}>Total: {resultsTotalXp || xp} XP</Text>
              <PressableScale
                style={styles.primaryBtn}
                onPress={handleNextTopic}
                scaleTo={0.98}
              >
                <Text style={styles.primaryBtnText}>Next Topic</Text>
              </PressableScale>
              <PressableScale
                style={styles.secondaryBtn}
                onPress={() => router.replace('/dashboard')}
                scaleTo={0.98}
              >
                <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
              </PressableScale>
            </View>
          </View>
        );
      }

      default:
        return null;
    }
  }

  const showNav = !loading && !notFound && cards[0]?.type !== 'comingSoon';
  const canGoBack = currentIndex > 0;
  const canGoNext =
    currentIndex < cards.length - 1 && canAdvanceFrom(currentIndex);

  return (
    <SafeAreaView style={styles.safe}>
      <AchievementToast
        achievement={newAchievement}
        onDismiss={() => setNewAchievement(null)}
      />

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => goBack('/dashboard')}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          {cards.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langPill,
                selectedLanguage === lang.code && styles.langPillActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text
                style={[
                  styles.langPillText,
                  selectedLanguage === lang.code && styles.langPillTextActive,
                ]}
              >
                {lang.code.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      ) : (
        <>
          <View style={styles.carouselContainer}>
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.carousel, carouselStyle]}>
                {cards.map((card, i) => (
                  <View key={`${card.type}-${card.quizIndex ?? i}`} style={styles.cardWrap}>
                    {renderCard(card, i)}
                  </View>
                ))}
              </Animated.View>
            </GestureDetector>
          </View>

          {showNav && (
            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.navBtn, !canGoBack && styles.navBtnDisabled]}
                onPress={() => canGoBack && goToIndex(currentIndex - 1)}
                activeOpacity={0.85}
              >
                <Text style={[styles.navBtnText, !canGoBack && styles.navBtnTextDisabled]}>
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnPrimary, !canGoNext && styles.navBtnDisabled]}
                onPress={() => canGoNext && goToIndex(currentIndex + 1)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.navBtnTextPrimary,
                    !canGoNext && styles.navBtnTextDisabled,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.light,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 22,
    color: THEME.text,
    fontFamily: 'Poppins-Bold',
  },
  dotsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 135, 81, 0.25)',
  },
  dotActive: {
    backgroundColor: THEME.primary,
    width: 20,
  },
  langRow: {
    flexDirection: 'row',
    gap: 4,
  },
  langPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 135, 81, 0.2)',
  },
  langPillActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  langPillText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: THEME.muted,
  },
  langPillTextActive: {
    color: THEME.white,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: THEME.muted,
  },
  carouselContainer: {
    flex: 1,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  carousel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingLeft: 16,
  },
  cardWrap: {
    marginRight: CARD_GAP,
    height: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: THEME.white,
    borderRadius: CARD_RADIUS,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
    minHeight: 420,
    maxHeight: '100%',
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: THEME.primary,
    marginBottom: 16,
  },
  cardScroll: {
    flex: 1,
  },
  cardBodyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  topicSubject: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: THEME.muted,
    textAlign: 'center',
  },
  topicTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    color: THEME.text,
    textAlign: 'center',
  },
  gradeBadge: {
    backgroundColor: THEME.light,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 8,
  },
  gradeBadgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: THEME.dark,
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: THEME.white,
  },
  secondaryBtn: {
    backgroundColor: THEME.light,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 135, 81, 0.2)',
  },
  secondaryBtnText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: THEME.dark,
  },
  comingSoonEmoji: {
    fontSize: 56,
  },
  comingSoonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: THEME.text,
    textAlign: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    paddingRight: 8,
  },
  bullet: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: THEME.primary,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: THEME.text,
    lineHeight: 24,
  },
  exampleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    paddingRight: 8,
  },
  exampleFlag: {
    fontSize: 20,
  },
  exampleText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: THEME.text,
    lineHeight: 24,
  },
  summaryText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: THEME.text,
    lineHeight: 26,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: THEME.muted,
    fontStyle: 'italic',
  },
  quizQuestion: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: THEME.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  quizOptions: {
    gap: 10,
  },
  quizOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  quizOptionText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: THEME.text,
    lineHeight: 22,
  },
  explanationBox: {
    marginTop: 16,
    backgroundColor: THEME.light,
    padding: 14,
    borderRadius: 12,
  },
  explanationText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: THEME.muted,
    lineHeight: 22,
  },
  resultsEmoji: {
    fontSize: 48,
  },
  resultsScore: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    color: THEME.primary,
  },
  resultsSub: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: THEME.muted,
  },
  xpBadge: {
    backgroundColor: THEME.light,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  xpBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: THEME.dark,
  },
  totalXp: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: THEME.muted,
    marginBottom: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 135, 81, 0.2)',
  },
  navBtnPrimary: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: THEME.dark,
  },
  navBtnTextPrimary: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: THEME.white,
  },
  navBtnTextDisabled: {
    opacity: 0.6,
  },
});
