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
import { getGreeting, getUIText } from '@/constants/languages';
import { getNigerianGrade, getLessonQuickActions, getQuickPrompts } from '@/constants/subjects';
import { type Achievement, XP_REWARDS, checkNewAchievements } from '@/constants/achievements';
import { getPersonality, type TutorPersonality } from '@/constants/personalities';
import { AchievementToast } from '@/components/AchievementToast';
import {
  buildSystemPrompt,
  getChallengePrompt,
  getSimplifyPrompt,
  isAIServiceError,
  sendAIMessage,
} from '@/services/aiService';
import { QuickActionBar } from '@/components/QuickActionBar';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Atmosphere } from '@/components/Atmosphere';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { MarkdownMessage } from '@/components/MarkdownMessage';
import { TutorAvatar } from '@/components/TutorAvatar';
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

function BounceDot({ delay, color }: { delay: number; color: string }) {
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

  return <Animated.View style={[styles.thinkingDot, { backgroundColor: color }, animStyle]} />;
}

function ThinkingIndicator({ personality }: { personality: TutorPersonality }) {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={styles.aiRow}>
      <TutorAvatar size={32} personality={personality} />
      <View style={[
        styles.aiBubble,
        {
          backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF',
          borderColor: colors.border,
        },
      ]}>
        <View style={styles.thinkingDotsRow}>
          <BounceDot delay={0} color={colors.primary} />
          <BounceDot delay={160} color={colors.primary} />
          <BounceDot delay={320} color={colors.primary} />
        </View>
        <Text style={[styles.typingText, { color: colors.textSecondary }]}>Aunty Naija is thinking...</Text>
      </View>
    </View>
  );
}

function ChatBubble({
  item,
  personality,
  isDarkMode,
}: {
  item: ChatMessage;
  personality: TutorPersonality;
  isDarkMode: boolean;
}) {
  const { colors } = useTheme();
  const isUser = item.role === 'user';
  const time = formatTime(item.timestamp);

  if (isUser) {
    return (
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        style={styles.userBubbleWrap}
      >
        <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
          <Text style={styles.userBubbleText}>{item.content}</Text>
        </View>
        <Text style={[styles.bubbleTime, styles.bubbleTimeUser, { color: colors.textMuted }]}>{time}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(280).springify()}>
      <View style={styles.aiRow}>
        <TutorAvatar size={32} personality={personality} />
        <View style={styles.aiBubbleColumn}>
          <View style={[
            styles.aiBubble,
            {
              backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}>
            <MarkdownMessage content={item.content} />
          </View>
          <Text style={[styles.bubbleTime, { color: colors.textMuted }]}>{time}</Text>
        </View>
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
  const ui = getUIText(selectedLanguage);
  const personality = getPersonality(selectedPersonalityId);
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;
  const lessonContextRef = useRef<string | null>(null);
  const { colors, isDarkMode } = useTheme();

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
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}>
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
          <View style={[
            styles.header,
            {
              backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF',
              borderBottomColor: colors.border,
            },
          ]}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backBtnText, { color: colors.primary }]}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerEmoji}>{selectedSubject?.icon ?? '📚'}</Text>
              <View style={styles.headerTextBlock}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {selectedSubject?.label ?? ui.learn}
                </Text>
                <Text style={[styles.headerSub, { color: colors.textMuted }]} numberOfLines={1}>
                  {personality.name}
                  {isQuizMode ? ` • ${ui.quizMode}` : ''}
                  {' • '}
                  {ui.primary} {selectedGrade}
                </Text>
              </View>
            </View>

            <View style={[styles.headerXP, { backgroundColor: colors.goldLight, borderColor: 'rgba(234,162,33,0.3)' }]}>
              <Text style={[styles.headerXPText, { color: colors.goldDark }]}>⚡ {xp} XP</Text>
            </View>
          </View>

          {gradeInfo && (
            <GlassCard style={[styles.gradeBanner, { backgroundColor: gradeInfo.bgColor, borderColor: colors.border }]}>
              <Text style={[styles.gradeLetter, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>
              <Text style={[styles.gradeDetail, { color: gradeInfo.color }]}>
                {quizScore}% · {gradeInfo.remark}
              </Text>
            </GlassCard>
          )}

          <FlatList
            ref={flatListRef}
            style={[styles.messageList, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.chatContainer,
              messages.length === 0 && styles.chatContainerEmpty,
            ]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <ChatBubble
                item={item}
                personality={personality}
                isDarkMode={isDarkMode}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <TutorAvatar size={80} personality={personality} />
                <Text style={[styles.emptyStatePersonality, { color: colors.textMuted }]}>
                  {personality.emoji} {personality.name ?? 'AI Tutor'}
                </Text>
                <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
                  Hi, I am {personality.name}!
                </Text>
                <Text style={[styles.emptyStateSub, { color: colors.textMuted }]}>
                  Ask me anything about {selectedSubject?.label ?? 'your lesson'} or tap 🎯 to start a quiz.
                </Text>
              </View>
            }
            ListFooterComponent={isAILoading ? <ThinkingIndicator personality={personality} /> : null}
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
                  style={[
                    styles.quickCard,
                    { backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF', borderColor: colors.border },
                    isCompact && styles.quickCardCompact,
                  ]}
                  onPress={() => handleSend(action.prompt)}
                  scaleTo={0.98}
                >
                  <Text style={styles.quickCardIcon}>{action.icon}</Text>
                  <Text style={[styles.quickCardText, { color: colors.textPrimary }]}>{action.label}</Text>
                </PressableScale>
              ))}
            </View>
          )}

          {showCharCount && (
            <Text style={[styles.charCount, { color: colors.textMuted }]}>
              {inputText.length}/{CHAR_LIMIT}
            </Text>
          )}

          <View style={[
            styles.inputBar,
            {
              backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF',
              borderTopColor: colors.border,
            },
          ]}>
            <TouchableOpacity
              style={[styles.inputBarAction, { backgroundColor: colors.primaryLight }]}
              onPress={handleStartQuiz}
              disabled={isAILoading}
            >
              <Text style={styles.inputBarActionEmoji}>🎯</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.inputField, {
                color: colors.textPrimary,
                backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0',
              }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isConnected ? 'Ask anything...' : 'No internet connection...'}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={CHAR_LIMIT}
              editable={!isAILoading && isConnected}
              onSubmitEditing={() => handleSend()}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: colors.primary },
                (!inputText.trim() || isAILoading || !isConnected) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isAILoading || !isConnected}
            >
              <Text style={styles.sendBtnText}>
                {isAILoading ? '...' : '➤'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, width: '100%', maxWidth: 1000, alignSelf: 'center', zIndex: 2 },
  contentWide: { maxWidth: 1180 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    zIndex: 3,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minWidth: 0,
  },
  headerTextBlock: { flex: 1, minWidth: 0 },
  headerEmoji: { fontSize: 28 },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  headerSub: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
  },
  headerXP: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    flexShrink: 0,
  },
  headerXPText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Bold',
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
  },
  gradeLetter: { fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.xxl },
  gradeDetail: { fontFamily: 'Poppins-Bold', fontSize: FONT_SIZES.sm },
  messageList: { flex: 1 },
  chatContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  chatContainerEmpty: {
    flexGrow: 1,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  aiBubbleColumn: { flex: 1, maxWidth: '82%' },
  aiBubble: {
    maxWidth: '100%',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.xl,
    borderTopLeftRadius: RADIUS.sm,
    padding: SPACING.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  userBubbleWrap: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    marginBottom: SPACING.sm,
  },
  userBubble: {
    maxWidth: '100%',
    alignSelf: 'flex-end',
    borderRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.sm,
    padding: SPACING.lg,
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  bubbleTime: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  bubbleTimeUser: { textAlign: 'right', marginRight: 4, marginLeft: 0 },
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
  },
  typingText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.md,
    minHeight: 320,
  },
  emptyStatePersonality: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 24,
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
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  quickCardCompact: { width: '100%' },
  quickCardIcon: { fontSize: FONT_SIZES.md },
  quickCardText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: FONT_SIZES.sm,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
    paddingHorizontal: SPACING.lg,
    marginBottom: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
  },
  inputBarAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputBarActionEmoji: { fontSize: 18 },
  inputField: {
    flex: 1,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    maxHeight: 100,
    lineHeight: 22,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
