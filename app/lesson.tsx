/**
 * AI lesson chat screen (`/lesson`).
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore, type ChatMessage } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { saveProgress } from '@/services/dbService';
import { LANGUAGES, getGreeting, getUIText } from '@/constants/languages';
import { getNigerianGrade, getLessonQuickActions, getQuickPrompts } from '@/constants/subjects';
import { type Achievement, XP_REWARDS, checkNewAchievements } from '@/constants/achievements';
import { getPersonality } from '@/constants/personalities';
import { AchievementToast } from '@/components/AchievementToast';
import {
  buildSystemPrompt,
  getChallengePrompt,
  getSimplifyPrompt,
  isAIServiceError,
  sendAIMessage,
} from '@/services/aiService';
import { QuickActionBar } from '@/components/QuickActionBar';
import { COLORS, SPACING, RADIUS, FONT_SIZES, GRADIENTS } from '@/constants/theme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { MarkdownMessage } from '@/components/MarkdownMessage';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const QUIZ_QUESTION_TARGET = 3;
const CHAR_LIMIT = 500;
const CHAR_WARN_AT = 400;

function normalizeQuizChoice(text: string): string | null {
  const trimmed = text.trim().toUpperCase();
  const match = trimmed.match(/^([A-D])\b/) ?? trimmed.match(/\b([A-D])\b/);
  return match ? match[1] : null;
}

function extractCorrectAnswerFromFeedback(reply: string): string | null {
  const patterns = [
    /correct answer(?:\s+is)?\s*:?\s*([A-D])\b/i,
    /(?:the )?answer is\s*([A-D])\b/i,
    /option\s*([A-D])\s+is correct/i,
  ];
  for (const pattern of patterns) {
    const match = reply.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return null;
}

function isReplyMarkedCorrect(reply: string): boolean | null {
  const lower = reply.toLowerCase();
  const firstSentence = lower.split(/[.!?]/)[0] ?? lower;
  if (/\b(incorrect|wrong|not quite|unfortunately|that's not)\b/.test(firstSentence)) {
    return false;
  }
  if (/\b(correct|right|well done|great job|excellent)\b/.test(firstSentence)) {
    return true;
  }
  return null;
}

function scoreQuizAnswer(userAnswer: string, assistantReply: string): boolean {
  const userChoice = normalizeQuizChoice(userAnswer);
  const correctChoice = extractCorrectAnswerFromFeedback(assistantReply);
  if (userChoice && correctChoice) {
    return userChoice === correctChoice;
  }
  const marked = isReplyMarkedCorrect(assistantReply);
  return marked ?? false;
}

function isMultipleChoiceQuestion(content: string): boolean {
  const optionLetters = new Set<string>();
  const patterns = [
    /(?:^|[\n\r]|[\s(*\-\d.])([A-D])\s*[).:]\s*\S/gim,
    /(?:^|[\n\r]|[\s(*\-\d.])([A-D])\s*[-–—]\s*\S/gim,
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      optionLetters.add(match[1].toUpperCase());
    }
  }
  return optionLetters.size >= 2;
}

function findLastQuizQuestion(messages: ChatMessage[]): ChatMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg.role === 'assistant' && isMultipleChoiceQuestion(msg.content)) {
      return msg;
    }
  }
  return undefined;
}

function getFriendlyAIErrorMessage(error: unknown): string {
  if (isAIServiceError(error)) {
    switch (error.type) {
      case 'quota_exceeded':
        return 'Aunty Naija is resting for a moment. Please try again in a few minutes! 😊';
      case 'no_internet':
        return 'No internet connection. Please check your data or WiFi and try again.';
      case 'api_error':
      case 'unknown':
      default:
        return 'Something went wrong. Please try again!';
    }
  }
  return 'Something went wrong. Please try again!';
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function BounceDot({ delay }: { delay: number }) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 320 }),
          withTiming(0, { duration: 320 })
        ),
        -1
      )
    );
  }, [delay, y]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[styles.thinkingDot, animStyle]} />;
}

function ThinkingIndicator() {
  return (
    <View style={styles.typingWrap}>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>👩🏽‍🏫</Text>
      </View>
      <View style={styles.typingBubble}>
        <View style={styles.thinkingDotsRow}>
          <BounceDot delay={0} />
          <BounceDot delay={160} />
          <BounceDot delay={320} />
        </View>
        <Text style={styles.typingText}>Aunty Naija is thinking...</Text>
      </View>
    </View>
  );
}

function ChatBubble({ item, personalityEmoji }: { item: ChatMessage; personalityEmoji: string }) {
  const isUser = item.role === 'user';
  const time = formatTime(item.timestamp);

  return (
    <Animated.View
      entering={FadeInDown.duration(280).springify()}
      style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAI]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{personalityEmoji}</Text>
        </View>
      )}
      <View style={styles.bubbleColumn}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          {isUser ? (
            <>
              <View style={styles.bubbleUserGradientBase} />
              <View style={styles.bubbleUserGradientTop} />
              <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{item.content}</Text>
            </>
          ) : (
            <MarkdownMessage content={item.content} />
          )}
        </View>
        <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>{time}</Text>
      </View>
    </Animated.View>
  );
}

export default function LessonScreen() {
  const { isConnected } = useNetworkStatus();
  const {
    selectedLanguage,
    selectedGrade,
    selectedSubject,
    selectedPersonalityId,
    messages,
    isAILoading,
    addMessage,
    clearMessages,
    setAILoading,
    startSession,
    endSession,
  } = useAppStore();
  const xp = useAppStore((s) => s.xp);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const addXP = useAppStore((s) => s.addXP);
  const updateStreak = useAppStore((s) => s.updateStreak);
  const incrementLessons = useAppStore((s) => s.incrementLessons);
  const updateBestQuizScore = useAppStore((s) => s.updateBestQuizScore);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);
  const user = useAuthStore((s) => s.user);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [inputText, setInputText] = useState('');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const isQuizModeRef = useRef(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const quizStatsRef = useRef({ correct: 0, answered: 0 });
  const lang = LANGUAGES.find((l) => l.code === selectedLanguage)!;
  const ui = getUIText(selectedLanguage);
  const personality = getPersonality(selectedPersonalityId);
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;
  const lessonContextRef = useRef<string | null>(null);
  const xpPulse = useSharedValue(1);

  useEffect(() => {
    xpPulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1
    );
  }, [xpPulse]);

  const xpBadgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpPulse.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      startSession();

      if (!selectedSubject || !selectedGrade) {
        return () => {
          endSession();
        };
      }

      const today = new Date().toISOString().split('T')[0];
      const isFirstLessonToday = useAppStore.getState().lastStudyDate !== today;
      updateStreak();
      addXP(XP_REWARDS.LESSON_STARTED);
      incrementLessons();
      if (isFirstLessonToday) {
        addXP(XP_REWARDS.FIRST_LESSON_OF_DAY);
      }

      const contextKey = `${selectedSubject.id}:${selectedGrade}:${selectedLanguage}`;
      const contextChanged = lessonContextRef.current !== contextKey;
      if (contextChanged) {
        lessonContextRef.current = contextKey;
        clearMessages();
        setIsQuizMode(false);
        isQuizModeRef.current = false;
        setQuizScore(null);
        quizStatsRef.current = { correct: 0, answered: 0 };
        const greeting = getGreeting(selectedLanguage, selectedSubject.label, selectedGrade);
        addMessage({ role: 'assistant', content: greeting });
      }

      return () => {
        endSession();
      };
    }, [selectedSubject?.id, selectedGrade, selectedLanguage, addXP, incrementLessons, updateStreak])
  );

  if (!selectedGrade) return <Redirect href="/grade" />;
  if (!selectedSubject) return <Redirect href="/dashboard" />;

  async function handleSend(overrideText?: string, forceQuizMode?: boolean) {
    const text = (overrideText ?? inputText).trim();
    if (!text || isAILoading || !selectedSubject || !selectedGrade) return;

    if (forceQuizMode) {
      isQuizModeRef.current = true;
      if (!isQuizMode) setIsQuizMode(true);
    }

    const priorMessages = useAppStore.getState().messages;
    const lastQuizQuestion = findLastQuizQuestion(priorMessages);
    const quizModeActive = Boolean(forceQuizMode || isQuizModeRef.current || isQuizMode);
    const scoringQuizAnswer = quizModeActive && !!lastQuizQuestion;

    setInputText('');
    addMessage({ role: 'user', content: text });
    setAILoading(true);

    const allMessages = useAppStore.getState().messages;
    const firstUserIndex = allMessages.findIndex((m) => m.role === 'user');
    const currentMessages =
      firstUserIndex === -1 ? [] : allMessages.slice(firstUserIndex);
    const systemPrompt = buildSystemPrompt(
      selectedLanguage,
      selectedSubject.label,
      selectedGrade,
      quizModeActive,
      selectedSubject.id,
      selectedPersonalityId
    );

    try {
      const reply = await sendAIMessage({
        messages: currentMessages,
        systemPrompt,
        grade: selectedGrade,
        subject: selectedSubject.label,
        language: selectedLanguage,
      });
      addMessage({ role: 'assistant', content: reply });

      if (scoringQuizAnswer) {
        const correct = scoreQuizAnswer(text, reply);
        const stats = quizStatsRef.current;
        stats.answered += 1;
        if (correct) stats.correct += 1;
        if (stats.answered >= QUIZ_QUESTION_TARGET) {
          const finalScore = Math.round((stats.correct / stats.answered) * 100);
          setQuizScore(finalScore);

          addXP(XP_REWARDS.QUIZ_COMPLETED);
          if (finalScore === 100) addXP(XP_REWARDS.PERFECT_QUIZ);
          updateBestQuizScore(finalScore);

          const newlyUnlocked = checkNewAchievements(
            {
              xp: useAppStore.getState().xp,
              streak: useAppStore.getState().streak,
              lessonsCompleted: useAppStore.getState().lessonsCompleted,
              bestQuizScore: finalScore,
            },
            unlockedAchievements
          );
          if (newlyUnlocked.length > 0) {
            newlyUnlocked.forEach((a) => unlockAchievement(a.id));
            setNewAchievement(newlyUnlocked[0]);
          }

          if (user) {
            await saveProgress({
              child_id: user.id,
              subject: selectedSubject.label,
              topic: selectedSubject.label,
              score: finalScore,
              duration_seconds: useAppStore.getState().totalSessionSeconds,
            });
          }
        }
      }
    } catch (error: unknown) {
      addMessage({ role: 'assistant', content: getFriendlyAIErrorMessage(error) });
    }

    setAILoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleStartQuiz() {
    isQuizModeRef.current = true;
    setIsQuizMode(true);
    setQuizScore(null);
    quizStatsRef.current = { correct: 0, answered: 0 };
    handleSend(
      getQuickPrompts(selectedSubject?.label ?? '', selectedGrade ?? 1, selectedLanguage)[2],
      true
    );
  }

  function handleQuickAction(actionId: string) {
    if (!selectedGrade || isAILoading) return;

    switch (actionId) {
      case 'simpler':
        handleSend(getSimplifyPrompt(selectedGrade));
        break;
      case 'harder':
        handleSend(getChallengePrompt(selectedGrade));
        break;
      case 'example':
        handleSend('Can you give me a Nigerian example to help me understand better?');
        break;
      case 'repeat':
        handleSend('Can you explain that again in a different way?');
        break;
      case 'summary':
        handleSend('Can you give me a short summary of what we just learned?');
        break;
    }
  }

  const gradeInfo = quizScore !== null ? getNigerianGrade(quizScore) : null;
  const showQuickPrompts = messages.length <= 1;
  const quickActions =
    selectedSubject && selectedGrade
      ? getLessonQuickActions(
          selectedSubject.id,
          selectedSubject.label,
          selectedGrade,
          selectedLanguage
        )
      : [];
  const showCharCount = inputText.length >= CHAR_WARN_AT;

  return (
    <SafeAreaView style={styles.safe}>
      <AchievementToast
        achievement={newAchievement}
        onDismiss={() => setNewAchievement(null)}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        enabled={Platform.OS !== 'web'}
      >
        <Atmosphere pointerEvents="none" />
        <View style={[styles.content, isWide && styles.contentWide]}>
          <GlassCard variant="elevated" style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View
              style={[
                styles.subjectIcon,
                { backgroundColor: selectedSubject?.bgColor ?? COLORS.primaryLight },
              ]}
            >
              <Text style={styles.subjectEmoji}>{selectedSubject?.icon ?? '📚'}</Text>
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {selectedSubject?.label ?? ui.learn}
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {ui.primary} {selectedGrade} · {lang.nativeLabel}
                {isQuizMode ? ` · ${ui.quizMode}` : ''}
              </Text>
              <TouchableOpacity
                style={styles.personalityRow}
                onPress={() => router.push('/personality')}
              >
                <Text style={styles.personalityEmoji}>{personality.emoji}</Text>
                <Text style={styles.personalityName}>{personality.name}</Text>
              </TouchableOpacity>
            </View>
            <Animated.View style={[styles.xpBadge, xpBadgeAnimStyle]}>
              <Text style={styles.xpText}>⚡ {xp} XP</Text>
            </Animated.View>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/progress')}>
              <Text style={styles.iconBtnEmoji}>📈</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quizBtn, { zIndex: 9999 }]}
              onPress={handleStartQuiz}
            >
              <Text style={styles.quizBtnText}>🧠 {ui.quiz}</Text>
            </TouchableOpacity>
          </GlassCard>

          {gradeInfo && (
            <GlassCard style={[styles.gradeBanner, { backgroundColor: gradeInfo.bgColor }]}>
              <Text style={[styles.gradeLetter, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>
              <Text style={[styles.gradeDetail, { color: gradeInfo.color }]}>
                {quizScore}% · {gradeInfo.remark}
              </Text>
            </GlassCard>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <ChatBubble item={item} personalityEmoji={personality.emoji} />
            )}
            ListFooterComponent={isAILoading ? <ThinkingIndicator /> : null}
          />

          {messages.length > 1 && (
            <QuickActionBar
              onAction={handleQuickAction}
              disabled={isAILoading}
              grade={selectedGrade ?? 1}
            />
          )}

          {showQuickPrompts && !isAILoading && selectedSubject && selectedGrade && (
            <View style={styles.quickCardsRow}>
              {quickActions.map((action) => (
                <PressableScale
                  key={action.label}
                  style={[styles.quickCard, isCompact && styles.quickCardCompact]}
                  onPress={() => handleSend(action.prompt)}
                  scaleTo={0.98}
                >
                  <Text style={styles.quickCardIcon}>{action.icon}</Text>
                  <Text style={styles.quickCardText}>{action.label}</Text>
                </PressableScale>
              ))}
            </View>
          )}

          <View style={styles.inputWrap}>
            {showCharCount && (
              <Text style={styles.charCount}>
                {inputText.length}/{CHAR_LIMIT}
              </Text>
            )}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isConnected ? ui.askPlaceholder : 'No internet connection...'}
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={CHAR_LIMIT}
                editable={!isAILoading && isConnected}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  styles.sendBtnGradient,
                  (!inputText.trim() || isAILoading || !isConnected) && styles.sendBtnDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isAILoading || !isConnected}
              >
                <View style={styles.sendBtnHighlight} />
                <Text style={styles.sendBtnText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, width: '100%', maxWidth: 1000, alignSelf: 'center', zIndex: 2 },
  contentWide: { maxWidth: 1180 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: { fontSize: FONT_SIZES.xl, color: COLORS.primaryDark, fontFamily: 'Poppins-Bold' },
  subjectIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectEmoji: { fontSize: 28 },
  headerCenter: { flex: 1, minWidth: 0 },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  personalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  personalityEmoji: { fontSize: 14 },
  personalityName: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primary,
  },
  xpBadge: {
    backgroundColor: COLORS.goldLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(234, 162, 33, 0.4)',
  },
  xpText: {
    color: COLORS.goldDark,
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBtnEmoji: { fontSize: 18 },
  quizBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quizBtnText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  gradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradeLetter: { fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.xxl },
  gradeDetail: { fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  chatContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.lg,
  },
  bubbleWrap: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-end' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapAI: { justifyContent: 'flex-start' },
  bubbleColumn: { maxWidth: '78%' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarEmoji: { fontSize: 22 },
  bubble: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  bubbleUser: {
    position: 'relative',
    minWidth: 48,
  },
  bubbleUserGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GRADIENTS.primaryDeep[0],
  },
  bubbleUserGradientTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '55%',
    backgroundColor: GRADIENTS.primary[0],
    opacity: 0.95,
  },
  bubbleAI: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  bubbleText: { fontSize: FONT_SIZES.md, lineHeight: 22, fontFamily: 'Poppins-Regular', zIndex: 1 },
  bubbleTextUser: { color: COLORS.white, fontFamily: 'Poppins-Regular', zIndex: 1 },
  bubbleTime: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },
  bubbleTimeUser: { textAlign: 'right', marginRight: 4, marginLeft: 0 },
  typingWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, paddingHorizontal: SPACING.lg },
  typingBubble: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    minWidth: 140,
  },
  thinkingDotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  typingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
  },
  quickCardsRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickCard: {
    width: '48%',
    minHeight: 56,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  quickCardCompact: { width: '100%' },
  quickCardIcon: { fontSize: FONT_SIZES.md },
  quickCardText: {
    color: COLORS.textPrimary,
    fontFamily: 'Poppins-SemiBold',
    fontSize: FONT_SIZES.sm,
  },
  inputWrap: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  charCount: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    textAlign: 'right',
    marginBottom: 4,
  },
  inputBar: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    maxHeight: 120,
    backgroundColor: '#F7FBF8',
    borderWidth: 1,
    borderColor: 'rgba(0, 87, 51, 0.08)',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sendBtnGradient: {
    backgroundColor: COLORS.primary,
  },
  sendBtnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontFamily: 'Poppins-Bold' },
});
