/**
 * AI lesson chat screen (`/lesson`).
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Alert,
  Animated as RNAnimated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import {
  Redirect,
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore, type ChatMessage } from '@/store/appStore';
import { saveProgress, syncProfile } from '@/services/dbService';
import { playSound } from '@/services/soundService';
import { getUIText } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import {
  getNigerianGrade,
  getLessonQuickActions,
  getQuickPrompts,
  getTopicsForSubject,
  findSubjectByLabel,
} from '@/constants/subjects';
import { type Achievement, type AchievementStats, XP_REWARDS, checkNewAchievements } from '@/constants/achievements';
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
import { OfflineLearning } from '@/components/OfflineLearning';
import LevelUpCelebration from '@/components/LevelUpCelebration';
import { AVATAR_UNLOCKS, getCurrentLevel } from '@/constants/levels';
import { useSpeech, type VoiceLanguage } from '@/hooks/useSpeech';
import { goBack } from '@/utils/navigation';
import { toTitleCase } from '@/utils/format';

const QUIZ_QUESTION_TARGET = 3;
const CHAR_LIMIT = 500;
const CHAR_WARN_AT = 400;

const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-NG',
  ha: 'ha',
  yo: 'yo',
  ig: 'ig',
};

const TOPIC_EMOJIS: Record<string, string> = {
  'Reading & Comprehension': '📖',
  'Grammar & Punctuation': '✏️',
  Vocabulary: '📝',
  'Creative Writing': '✍️',
  Spelling: '🔤',
  'Numbers & Counting': '🔢',
  'Addition & Subtraction': '➕',
  'Multiplication & Division': '✖️',
  Fractions: '🍕',
  'Shapes & Geometry': '📐',
  'Word Problems': '🧩',
  'Living Things': '🦋',
  'Plants & Animals': '🌿',
  'Human Body': '🫀',
  'Weather & Environment': '🌦️',
  'Simple Machines': '⚙️',
  'Health & Hygiene': '🧼',
  'My Family & Community': '👨‍👩‍👧',
  'Nigeria & Its People': '🇳🇬',
  'Our Government': '🏛️',
  'Map Reading': '🗺️',
  Transportation: '🚌',
  'Culture & Festivals': '🎉',
  'Rights & Responsibilities': '⚖️',
  'Good Citizenship': '🤝',
  'Our Constitution': '📜',
  'Community Service': '💚',
  Democracy: '🗳️',
  'National Symbols': '🦅',
  'Farming & Crops': '🌾',
  'Soil & Fertilizer': '🪴',
  'Farm Animals': '🐄',
  'Food & Nutrition': '🥗',
  'Farm Tools': '🔧',
  'Pest Control': '🐛',
  'Introduction & Basics': '🌟',
  'Key Concepts': '💡',
  'Practice & Examples': '✅',
  'Review & Quiz': '🎯',
  'Practice Problems': '📊',
  'Quick Quiz': '⚡',
  'Fun Facts': '🎲',
  'Brain Teaser': '🧠',
};

interface SpeechRecognitionResultEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

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
        return 'Oops! It looks like you are not connected to the internet. Check your WiFi and try again! 📶';
      case 'api_error':
      case 'unknown':
      default:
        return 'Hmm, something went a little wrong! 🙈 Tap the send button to try again.';
    }
  }
  return 'Hmm, something went a little wrong! 🙈 Tap the send button to try again.';
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

function TopicPickerCard({
  topic,
  emoji,
  isSelected,
  isDarkMode,
  onSelect,
}: {
  topic: string;
  emoji: string;
  isSelected: boolean;
  isDarkMode: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  function handlePressIn() {
    RNAnimated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }

  function handlePressOut() {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }

  return (
    <RNAnimated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.topicCard,
          {
            backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF',
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.topicCardEmoji}>{emoji}</Text>
        <Text
          style={[
            styles.topicCardLabel,
            { color: isSelected ? colors.primary : colors.textPrimary },
          ]}
        >
          {topic}
        </Text>
      </TouchableOpacity>
    </RNAnimated.View>
  );
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
  onToggleSpeak,
  isSpeaking,
}: {
  item: ChatMessage;
  personality: TutorPersonality;
  isDarkMode: boolean;
  onToggleSpeak?: (text: string) => void;
  isSpeaking?: boolean;
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
            <MarkdownMessage content={item.content} fontSize={17} lineHeight={26} />
            {onToggleSpeak && (
              <View style={styles.bubbleFooter}>
                <TouchableOpacity
                  style={styles.speakerBtn}
                  onPress={() => onToggleSpeak(item.content)}
                  accessibilityLabel={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  <Text style={styles.speakerIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
                </TouchableOpacity>
              </View>
            )}
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
    offline: offlineParam,
    subject: subjectParam,
    topic: topicParam,
    isChallenge: isChallengeParam,
  } = useLocalSearchParams<{
    offline?: string;
    subject?: string;
    topic?: string;
    isChallenge?: string;
  }>();
  const isChallenge = isChallengeParam === 'true';
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const dismissedOfflineRef = useRef(false);
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
  const updateBestQuizScore = useAppStore((s) => s.updateBestQuizScore);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);
  const setLastSession = useAppStore((s) => s.setLastSession);
  const markFlowCompleted = useAppStore((s) => s.markFlowCompleted);
  const updateSubjectProgress = useAppStore((s) => s.updateSubjectProgress);
  const setSubject = useAppStore((s) => s.setSubject);
  const { speak, stop, toggle, isSpeaking } = useSpeech(
    (selectedLanguage as VoiceLanguage) ?? 'en'
  );
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const lastSpokenIdRef = useRef<string | null>(null);
  const lessonStartRef = useRef<number>(Date.now());
  const hasCountedLesson = useRef(false);
  const [topicSelected, setTopicSelected] = useState(
    () => isChallengeParam === 'true' && Boolean(topicParam)
  );
  const [selectedTopic, setSelectedTopic] = useState(() => {
    const t = topicParam;
    return typeof t === 'string' ? t : Array.isArray(t) ? t[0] ?? '' : '';
  });
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const coinAnim = useRef(new RNAnimated.Value(0)).current;
  const coinOpacity = useRef(new RNAnimated.Value(0)).current;
  const [xpGained, setXpGained] = useState(0);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    title: string;
    emoji: string;
  } | null>(null);
  const [showUnlockToast, setShowUnlockToast] = useState(false);
  const [newUnlock, setNewUnlock] = useState<{
    emoji: string;
    name: string;
  } | null>(null);
  const unlockToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topicGridScaleAnim = useRef(new RNAnimated.Value(0.92)).current;
  const challengeStartedRef = useRef(false);
  const quizXpAwarded = useRef(false);
  const quizStartTime = useRef<number | null>(null);
  const hadFailedQuizRef = useRef(false);
  const navigation = useNavigation();
  const [inputText, setInputText] = useState('');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const isQuizModeRef = useRef(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const quizStatsRef = useRef({ correct: 0, answered: 0 });
  const ui = getUIText(selectedLanguage);
  const { t } = useTranslation();
  const personality = getPersonality(selectedPersonalityId);
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isWide = width > 1200;
  const showSendHint = Platform.OS === 'web' && width > 768;
  const lessonContextRef = useRef<string | null>(null);
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    if (offlineParam === '1') {
      setShowOfflineMode(true);
    }
  }, [offlineParam]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (
      autoSpeak &&
      last?.role === 'assistant' &&
      last.id !== lastSpokenIdRef.current
    ) {
      lastSpokenIdRef.current = last.id;
      speak(last.content);
    }
  }, [messages, autoSpeak, speak]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  useEffect(() => {
    return () => {
      hasCountedLesson.current = false;
    };
  }, []);

  const triggerCoinAnimation = useCallback((amount: number) => {
    playSound('xp');
    setXpGained(amount);
    setShowCoinAnim(true);
    coinAnim.setValue(0);
    coinOpacity.setValue(1);

    RNAnimated.parallel([
      RNAnimated.timing(coinAnim, {
        toValue: -80,
        duration: 800,
        useNativeDriver: true,
      }),
      RNAnimated.sequence([
        RNAnimated.delay(500),
        RNAnimated.timing(coinOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowCoinAnim(false);
    });
  }, [coinAnim, coinOpacity]);

  const awardXP = useCallback(
    (baseAmount: number) => {
      const xpBefore = useAppStore.getState().xp;
      const levelBefore = getCurrentLevel(xpBefore);
      const challengeEligible =
        isChallenge && !useAppStore.getState().dailyChallengeCompleted;
      const amount = challengeEligible ? baseAmount * 3 : baseAmount;

      addXP(amount);
      const xpAfter = useAppStore.getState().xp;
      const levelAfter = getCurrentLevel(xpAfter);

      if (levelAfter.level > levelBefore.level) {
        const lastCelebratedLevel = useAppStore.getState().lastCelebratedLevel;
        if (lastCelebratedLevel < levelAfter.level) {
          setLevelUpData({
            level: levelAfter.level,
            title: levelAfter.title,
            emoji: levelAfter.emoji,
          });
          playSound('levelUp');
          setShowLevelUp(true);
        }
      }

      triggerCoinAnimation(amount);

      const unlockedAvatars = useAppStore.getState().unlockedAvatars;
      const unlockAvatar = useAppStore.getState().unlockAvatar;
      for (const avatar of AVATAR_UNLOCKS) {
        if (
          xpAfter >= avatar.requiredXP &&
          !unlockedAvatars.includes(avatar.emoji)
        ) {
          unlockAvatar(avatar.emoji);
          setNewUnlock({ emoji: avatar.emoji, name: avatar.name });
          playSound('unlock');
          setShowUnlockToast(true);
          if (unlockToastTimerRef.current) {
            clearTimeout(unlockToastTimerRef.current);
          }
          unlockToastTimerRef.current = setTimeout(() => {
            setShowUnlockToast(false);
          }, 3000);
        }
      }

      if (challengeEligible) {
        useAppStore.getState().completeDailyChallenge();
      }

      syncProfile().catch((err) =>
        console.error('Sync after XP failed:', err)
      );
    },
    [addXP, isChallenge, triggerCoinAnimation]
  );

  useEffect(() => {
    return () => {
      if (unlockToastTimerRef.current) {
        clearTimeout(unlockToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!topicSelected || messages.length === 0) return;

      e.preventDefault();
      Alert.alert(
        'Leave lesson?',
        'Your progress in this topic will be saved.',
        [
          { text: 'Keep Learning', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, topicSelected, messages.length]);

  useEffect(() => {
    if (!topicSelected && !showOfflineMode) {
      topicGridScaleAnim.setValue(0.92);
      RNAnimated.spring(topicGridScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [topicSelected, showOfflineMode, topicGridScaleAnim]);

  function buildAchievementStats(
    extra?: Partial<AchievementStats>
  ): AchievementStats {
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
  }

  function trackLessonAchievements() {
    const store = useAppStore.getState();
    const now = new Date();
    const day = now.getDay();
    if (day === 0 || day === 6) {
      store.incrementWeekendLessons();
    }
    if (selectedLanguage !== 'en') {
      store.incrementNonEnglishLessons();
    }
    if (selectedSubject?.label) {
      store.addUniqueSubject(selectedSubject.label);
    }
    store.incrementTodaysLessons();
  }

  function countLessonOnce() {
    if (!hasCountedLesson.current) {
      hasCountedLesson.current = true;
      useAppStore.getState().incrementLessons();
      if (selectedSubject?.label) {
        useAppStore.getState().incrementSubjectLesson(selectedSubject.label);
      }
      trackLessonAchievements();
      syncProfile().catch((err) =>
        console.error('Sync after XP failed:', err)
      );
    }
  }

  useEffect(() => {
    if (!isChallenge || challengeStartedRef.current) return;
    const label = typeof subjectParam === 'string' ? subjectParam : '';
    const topic = typeof topicParam === 'string' ? topicParam : '';
    if (!label || !topic) return;

    const match = findSubjectByLabel(label);
    if (match)     setSubject(match);

    setSelectedTopic(topic);
    setTopicSelected(true);
    challengeStartedRef.current = true;
  }, [isChallenge, subjectParam, topicParam, setSubject]);

  useEffect(() => {
    if (!isChallenge || !topicSelected || !selectedTopic || messages.length > 0) return;
    if (!selectedSubject) return;
    handleSend(
      `I want to learn about ${selectedTopic} in ${selectedSubject.label}`,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChallenge, topicSelected, selectedTopic, selectedSubject?.label]);

  async function handleMicPress() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
          .webkitSpeechRecognition ??
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
          .SpeechRecognition;
      if (!SpeechRecognition) {
        setIsListening(false);
        return;
      }
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = SPEECH_LANG_MAP[selectedLanguage] ?? 'en-NG';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: SpeechRecognitionResultEvent) => {
        const transcript =
          event.results[0]?.[0]?.transcript?.trim() ?? '';

        if (!transcript) {
          setIsListening(false);
          return;
        }

        setInputText(transcript);
        setIsListening(false);

        setTimeout(() => {
          handleSend(transcript);
        }, 600);
      };
      recognition.onerror = (event: { error?: string }) => {
        console.log('Speech error:', event.error);
        setIsListening(false);

        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setInputText('');
        }
      };
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      Alert.alert(
        'Microphone not available',
        'Speech recognition is not supported on this device.',
      );
    }
  }

  useEffect(() => {
    const hasUserMessages = messages.some((m) => m.role === 'user');
    if (
      !isConnected &&
      !hasUserMessages &&
      !dismissedOfflineRef.current
    ) {
      setShowOfflineMode(true);
    }
  }, [isConnected, messages]);

  useFocusEffect(
    useCallback(() => {
      lessonStartRef.current = Date.now();
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
      if (isFirstLessonToday) {
        addXP(XP_REWARDS.FIRST_LESSON_OF_DAY);
      }

      setLastSession(
        selectedSubject.label,
        selectedSubject.icon ?? '📚',
        selectedGrade,
        selectedPersonalityId,
      );

      const contextKey = `${selectedSubject.id}:${selectedGrade}:${selectedLanguage}`;
      const contextChanged = lessonContextRef.current !== contextKey;
      if (contextChanged) {
        lessonContextRef.current = contextKey;
        clearMessages();
        setIsQuizMode(false);
        isQuizModeRef.current = false;
        setQuizScore(null);
        quizStatsRef.current = { correct: 0, answered: 0 };
        if (!isChallenge) {
          setTopicSelected(false);
          setSelectedTopic('');
        }
        quizXpAwarded.current = false;
        quizStartTime.current = null;
        hadFailedQuizRef.current = false;
      }

      return () => {
        endSession();
      };
    }, [
      selectedSubject?.id,
      selectedSubject?.label,
      selectedSubject?.icon,
      selectedGrade,
      selectedLanguage,
      selectedPersonalityId,
      addXP,
      updateStreak,
      setLastSession,
      clearMessages,
      endSession,
      startSession,
      isChallenge,
    ])
  );

  if (!selectedGrade) return <Redirect href="/grade" />;
  if (!selectedSubject) return <Redirect href="/dashboard" />;

  async function handleSend(overrideText?: string, forceQuizMode?: boolean) {
    const text = (overrideText ?? inputText).trim();
    if (!text || isAILoading || !selectedSubject || !selectedGrade) return;
    setInputText('');

    if (forceQuizMode) {
      isQuizModeRef.current = true;
      if (!isQuizMode) setIsQuizMode(true);
    }

    const priorMessages = useAppStore.getState().messages;
    const lastQuizQuestion = findLastQuizQuestion(priorMessages);
    const quizModeActive = Boolean(forceQuizMode || isQuizModeRef.current || isQuizMode);
    const scoringQuizAnswer = quizModeActive && !!lastQuizQuestion;

    addMessage({ role: 'user', content: text });
    setAILoading(true);

    const allMessages = useAppStore.getState().messages;
    const firstUserIndex = allMessages.findIndex((m) => m.role === 'user');
    const currentMessages =
      firstUserIndex === -1 ? [] : allMessages.slice(firstUserIndex);
    const childName = useAppStore.getState().userName;
    const systemPrompt = buildSystemPrompt(
      selectedLanguage,
      selectedSubject.label,
      selectedGrade,
      quizModeActive,
      selectedSubject.id,
      selectedPersonalityId,
      childName ? toTitleCase(childName) : undefined
    );

    try {
      const reply = await sendAIMessage({
        messages: currentMessages,
        systemPrompt,
        grade: selectedGrade,
        subject: selectedSubject.label,
        language: selectedLanguage,
      });
      const assistantContent =
        !reply || reply.trim() === ''
          ? "Hmm, I didn't catch that. Try asking again! 🤔"
          : reply;
      addMessage({ role: 'assistant', content: assistantContent });

      if (scoringQuizAnswer) {
        const correct = scoreQuizAnswer(text, reply);
        playSound(correct ? 'correct' : 'wrong');
        const stats = quizStatsRef.current;
        stats.answered += 1;
        if (correct) stats.correct += 1;
        if (stats.answered >= QUIZ_QUESTION_TARGET) {
          const finalScore = Math.round((stats.correct / stats.answered) * 100);
          setQuizScore(finalScore);

          if (!quizXpAwarded.current) {
            quizXpAwarded.current = true;
            let quizXp = XP_REWARDS.QUIZ_COMPLETED;
            if (finalScore === 100) {
              quizXp += XP_REWARDS.PERFECT_QUIZ;
            }
            awardXP(quizXp);
          }
          updateBestQuizScore(finalScore);

          const store = useAppStore.getState();
          if (finalScore === 100) {
            store.setConsecutivePerfectQuizzes(store.consecutivePerfectQuizzes + 1);
          } else {
            store.setConsecutivePerfectQuizzes(0);
          }
          if (quizStartTime.current) {
            const secs = Math.round((Date.now() - quizStartTime.current) / 1000);
            if (
              store.fastestQuizSeconds === null ||
              secs < store.fastestQuizSeconds
            ) {
              store.setFastestQuizSeconds(secs);
            }
          }
          if (hadFailedQuizRef.current && finalScore >= 60) {
            store.setRetriedAndPassedQuiz(true);
          }
          if (finalScore < 60) {
            hadFailedQuizRef.current = true;
          }

          const newlyUnlocked = checkNewAchievements(
            buildAchievementStats({ bestQuizScore: finalScore }),
            unlockedAchievements
          );
          if (newlyUnlocked.length > 0) {
            newlyUnlocked.forEach((a) => unlockAchievement(a.id));
            setNewAchievement(newlyUnlocked[0]);
          }

          const durationSecs = Math.round(
            (Date.now() - lessonStartRef.current) / 1000
          );
          const earnedXP = finalScore === 100 ? 75 : 25;
          saveProgress({
            subject: selectedSubject?.label ?? 'Unknown',
            topic: selectedTopic || (selectedSubject?.label ?? 'Unknown'),
            score: finalScore,
            grade: selectedGrade ?? 1,
            xpEarned: earnedXP,
            durationSeconds: durationSecs,
            flowCompleted: true,
            childId: null,
          }).catch((err) => console.error('saveProgress error:', err));

          useAppStore.getState().updateStreak();

          updateSubjectProgress(selectedSubject.label, selectedGrade, finalScore);
          countLessonOnce();
        }
      }
    } catch (error: unknown) {
      const hadUserMessages = priorMessages.some((m) => m.role === 'user');
      if (!isConnected && !hadUserMessages) {
        // OfflineLearning handles the first offline attempt
      } else {
        addMessage({ role: 'assistant', content: getFriendlyAIErrorMessage(error) });
      }
    }

    setAILoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleStartQuiz() {
    isQuizModeRef.current = true;
    setIsQuizMode(true);
    setQuizScore(null);
    quizStatsRef.current = { correct: 0, answered: 0 };
    hadFailedQuizRef.current = quizScore !== null && quizScore < 60;
    quizStartTime.current = Date.now();
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

  const subjectTopics = getTopicsForSubject(selectedSubject.label);

  function renderLessonOverlays() {
    return (
      <>
        {showLevelUp && levelUpData && (
          <LevelUpCelebration
            level={levelUpData.level}
            title={levelUpData.title}
            emoji={levelUpData.emoji}
            onDismiss={() => {
              setShowLevelUp(false);
              useAppStore.getState().markLevelCelebrated(levelUpData.level);
            }}
          />
        )}
        {showUnlockToast && newUnlock && (
          <View
            style={{
              position: 'absolute',
              top: 80,
              alignSelf: 'center',
              backgroundColor: '#1a1a2e',
              borderRadius: 50,
              paddingHorizontal: 20,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              zIndex: 1000,
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 24 }}>{newUnlock.emoji}</Text>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
              }}
            >
              New avatar unlocked: {newUnlock.name}!
            </Text>
          </View>
        )}
      </>
    );
  }

  function selectTopicAndStart(topic: string) {
    if (!selectedSubject) return;
    playSound('tap');
    setSelectedTopic(topic);
    setTopicSelected(true);
    if (selectedSubject && selectedGrade) {
      markFlowCompleted(selectedSubject.label, selectedGrade);
    }
    handleSend(`I want to learn about ${topic} in ${selectedSubject.label}`);
  }

  function handleChangeTopic() {
    setTopicSelected(false);
    setSelectedTopic('');
    quizXpAwarded.current = false;
    clearMessages();
    setIsQuizMode(false);
    isQuizModeRef.current = false;
    setQuizScore(null);
    quizStatsRef.current = { correct: 0, answered: 0 };
  }

  if (!topicSelected && !showOfflineMode && !isChallenge) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}>
        {renderLessonOverlays()}
        <View style={[styles.content, isWide && styles.contentWide, { flex: 1 }]}>
          <View
            style={[
              styles.header,
              {
                backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF',
                borderBottomColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => goBack('/dashboard')}
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Go back"
            >
              <Text style={{ fontSize: 22, color: colors.textPrimary }}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerEmoji}>{selectedSubject.icon}</Text>
              <View style={styles.headerTextBlock}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {selectedSubject.label}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.topicPickerScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.topicPickerEmoji}>{selectedSubject.icon}</Text>
            <Text style={[styles.topicPickerTitle, { color: colors.textPrimary }]}>
              {selectedSubject.label}
            </Text>
            <Text style={[styles.topicPickerSubtitle, { color: colors.textMuted }]}>
              What do you want to learn today?
            </Text>

            <RNAnimated.View
              style={[
                styles.topicGrid,
                { transform: [{ scale: topicGridScaleAnim }] },
              ]}
            >
              {subjectTopics.map((topic) => (
                <TopicPickerCard
                  key={topic}
                  topic={topic}
                  emoji={TOPIC_EMOJIS[topic] ?? '📌'}
                  isSelected={selectedTopic === topic}
                  isDarkMode={isDarkMode}
                  onSelect={() => selectTopicAndStart(topic)}
                />
              ))}
            </RNAnimated.View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0' }]}>
      {renderLessonOverlays()}
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
        {showCoinAnim && (
          <RNAnimated.View
            style={{
              position: 'absolute',
              bottom: 120,
              alignSelf: 'center',
              zIndex: 999,
              transform: [{ translateY: coinAnim }],
              opacity: coinOpacity,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>🪙</Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Poppins-Bold',
                color: colors.primary,
              }}
            >
              +{xpGained} XP
            </Text>
          </RNAnimated.View>
        )}
        <View style={[styles.content, isWide && styles.contentWide]}>
          <View style={[
            styles.header,
            {
              backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF',
              borderBottomColor: colors.border,
            },
          ]}>
            <TouchableOpacity
              onPress={() => goBack('/dashboard')}
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Go back"
            >
              <Text style={{ fontSize: 22, color: colors.textPrimary }}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerEmoji}>{selectedSubject?.icon ?? '📚'}</Text>
              <View style={styles.headerTextBlock}>
                <View style={styles.headerTitleRow}>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {selectedSubject?.label ?? ui.learn}
                  </Text>
                  <TouchableOpacity onPress={handleChangeTopic} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.changeTopicBtn, { color: colors.primary }]}>
                      Change Topic
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.headerSub, { color: colors.textMuted }]} numberOfLines={1}>
                  {personality.name}
                  {isQuizMode ? ` • ${ui.quizMode}` : ''}
                  {' • '}
                  {ui.primary} {selectedGrade}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.autoSpeakBtn, autoSpeak && styles.autoSpeakBtnActive]}
              onPress={() => {
                if (autoSpeak) stop();
                setAutoSpeak((s) => !s);
              }}
              accessibilityLabel={autoSpeak ? 'Mute auto read-aloud' : 'Enable auto read-aloud'}
            >
              <View style={styles.iconWithLabel}>
                <Text style={styles.autoSpeakIcon}>{autoSpeak ? '🔊' : '🔇'}</Text>
                <Text style={[styles.iconLabel, { color: colors.textMuted }]}>Audio</Text>
              </View>
            </TouchableOpacity>

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

          {showOfflineMode ? (
            <OfflineLearning
              grade={selectedGrade ?? 1}
              subject={selectedSubject?.label}
              onDismiss={() => {
                dismissedOfflineRef.current = true;
                setShowOfflineMode(false);
              }}
            />
          ) : (
          <>
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
                onToggleSpeak={toggle}
                isSpeaking={isSpeaking}
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
              style={[
                styles.inputBarAction,
                { backgroundColor: colors.primaryLight },
              ]}
              activeOpacity={0.75}
              onPress={handleStartQuiz}
              disabled={isAILoading}
              accessibilityLabel={t('startQuiz')}
            >
              <View style={styles.iconWithLabel}>
                <Text style={styles.inputBarActionEmoji}>🎯</Text>
                <Text style={[styles.iconLabel, { color: colors.textMuted }]}>Quiz</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.micBtn,
                {
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isListening
                    ? '#FF000015'
                    : colors.backgroundCard,
                  borderWidth: isListening ? 2 : 0,
                  borderColor: isListening ? '#FF4444' : 'transparent',
                },
              ]}
              onPress={handleMicPress}
              disabled={isAILoading || !isConnected}
              accessibilityLabel={isListening ? 'Stop listening' : 'Speak your question'}
            >
              <View style={styles.iconWithLabel}>
                <Text style={styles.micIcon}>{isListening ? '🔴' : '🎙️'}</Text>
                <Text style={[styles.iconLabel, { color: colors.textMuted }]}>Speak</Text>
              </View>
            </TouchableOpacity>

            <TextInput
              style={[
                styles.inputField,
                {
                  color: colors.textPrimary,
                  backgroundColor: isDarkMode ? '#0F1512' : '#F9F6F0',
                  fontSize: 16,
                },
                Platform.OS === 'web' && {
                  outlineStyle: 'none' as any,
                  outlineWidth: 0,
                } as any,
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isConnected ? t('askAnything') : t('error')}
              placeholderTextColor={colors.textMuted}
              multiline={false}
              maxLength={CHAR_LIMIT}
              editable={!isAILoading && isConnected}
              blurOnSubmit={false}
              returnKeyType="send"
              onSubmitEditing={() => {
                if (inputText.trim() && !isAILoading) {
                  handleSend();
                }
              }}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: colors.primary },
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              activeOpacity={0.75}
              onPress={() => {
                playSound('tap');
                handleSend();
              }}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendBtnText}>
                {isAILoading ? '...' : '➤'}
              </Text>
            </TouchableOpacity>
          </View>

          {showSendHint && (
            <Text style={[styles.sendHint, { color: colors.textMuted }]}>
              Tap send or press Enter to send
            </Text>
          )}
          </>
          )}
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
    fontSize: 17,
    lineHeight: 26,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputBarActionEmoji: { fontSize: 18 },
  iconWithLabel: {
    alignItems: 'center',
    gap: 2,
  },
  iconLabel: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.3,
  },
  inputField: {
    flex: 1,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    maxHeight: 100,
    lineHeight: 22,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  sendHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    paddingBottom: SPACING.xs,
    opacity: 0.6,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  speakerBtn: {
    padding: 4,
    opacity: 0.6,
  },
  speakerIcon: { fontSize: 14 },
  autoSpeakBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  autoSpeakBtnActive: {
    backgroundColor: COLORS.primary,
  },
  autoSpeakIcon: { fontSize: 16 },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  micBtnActive: {
    backgroundColor: COLORS.error,
  },
  micIcon: { fontSize: 18 },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  changeTopicBtn: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  topicPickerScroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  topicPickerEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  topicPickerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  topicPickerSubtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    width: '100%',
    justifyContent: 'center',
  },
  topicCard: {
    width: '47%',
    minWidth: 140,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  topicCardEmoji: { fontSize: 24 },
  topicCardLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 20,
  },
  topicPickerFooter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  letsLearnBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  letsLearnBtnDisabled: { opacity: 0.4 },
  letsLearnBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
});
