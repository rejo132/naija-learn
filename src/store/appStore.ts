/**
 * Global application state (Zustand).
 *
 * @remarks
 * **Responsible for:** Cross-screen selections (language, grade, subject), in-memory
 * chat transcript, AI loading flag, hydration readiness, and lesson session timing.
 *
 * **Talks to:**
 * - Imports: `zustand`, `LanguageCode` from `@/constants/languages`, `Subject` from
 *   `@/constants/subjects`.
 * - Exports: `ChatMessage` interface, `useAppStore` hook.
 * - Used by: all `app/*` flow screens; `ChatMessage` type is imported by `aiService`.
 *
 * **Notes for new developers:**
 * - Selections persist via AsyncStorage (`learnova-app-store`); chat does not.
 * - Default language is `'en'`; grade and subject start `null` until chosen or rehydrated.
 * - `addMessage` generates `id` and `timestamp` internally.
 * - Wait for `isAppReady` before rendering navigation so persisted grade/language do not flash the wrong screen.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LanguageCode } from '@/constants/languages';
import { DEFAULT_PERSONALITY_ID } from '@/constants/personalities';
import { Subject } from '@/constants/subjects';
import { syncProfile as syncProfileToDb } from '@/services/dbService';
import { supabase } from '@/lib/supabase';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type VoiceSpeedLevel = 'Slow' | 'Normal' | 'Fast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AppState {
  selectedLanguage: LanguageCode;
  selectedGrade: number | null;
  selectedSubject: Subject | null;
  selectedPersonalityId: string;
  messages: ChatMessage[];
  isAILoading: boolean;
  /**
   * `true` after AsyncStorage rehydration finishes. The root layout should not render
   * routes until this is set — otherwise users briefly see the welcome screen before
   * persisted grade/language load.
   */
  isAppReady: boolean;
  /** Unix ms when the current lesson screen gained focus; `null` when not in a lesson. */
  sessionStartTime: number | null;
  /** Seconds spent in lessons this install session; persisted for future parent reports. */
  totalSessionSeconds: number;
  // Gamification
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  lessonsCompleted: number;
  bestQuizScore: number;
  unlockedAchievements: string[];
  isDarkMode: boolean;
  soundEnabled: boolean;
  offlineMode: boolean;
  dataSaver: boolean;
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  difficulty: DifficultyLevel;
  voiceSpeed: VoiceSpeedLevel;
  isSignedOut: boolean;
  setupComplete: boolean;
  // ── Student profile (local display) ──
  userName: string;
  userAvatar: string;
  userGrade: string;
  // ── Save & resume ──
  /** Subject label of the most recently opened lesson, or null. */
  lastSubject: string | null;
  /** Emoji icon of the most recently opened subject. */
  lastSubjectEmoji: string | null;
  /** Grade of the most recently opened lesson. */
  lastGrade: number | null;
  /** Personality id selected for the most recent lesson. */
  lastPersonalityId: string | null;
  /** ISO timestamp of when the last lesson was opened. */
  lastOpenedAt: string | null;
  /** Per-subject completion percentage. Key: `${subjectLabel}_${grade}` → 0-100. */
  subjectProgress: Record<string, number>;
  /** Tracks whether the LearningFlow intro has been completed for a subject+grade. */
  completedFlows: Record<string, boolean>;
  /** Lessons completed per subject label. */
  subjectLessonsCount: Record<string, number>;
  dailyChallengeDate: string;
  dailyChallengeCompleted: boolean;
  dailyChallengeSubject: string;
  dailyChallengeTopic: string;
  lastCelebratedStreak: number;
  lastCelebratedLevel: number;
  unlockedAvatars: string[];
  weekendLessons: number;
  consecutivePerfectQuizzes: number;
  fastestQuizSeconds: number | null;
  retriedAndPassedQuiz: boolean;
  nonEnglishLessons: number;
  uniqueSubjectsTried: string[];
  todaysLessons: number;
  todaysLessonsDate: string;
  setLanguage: (lang: LanguageCode) => void;
  setGrade: (grade: number) => void;
  setSubject: (subject: Subject) => void;
  setPersonality: (id: string) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setAILoading: (loading: boolean) => void;
  setAppReady: (ready: boolean) => void;
  startSession: () => void;
  endSession: () => void;
  addXP: (amount: number) => void;
  updateStreak: () => void;
  incrementLessons: () => void;
  updateBestQuizScore: (score: number) => void;
  unlockAchievement: (id: string) => void;
  toggleDarkMode: () => void;
  setSoundEnabled: (v: boolean) => void;
  setOfflineMode: (v: boolean) => void;
  setDataSaver: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setNotificationHour: (hour: number) => void;
  setNotificationMinute: (minute: number) => void;
  setDifficulty: (v: DifficultyLevel) => void;
  setVoiceSpeed: (v: VoiceSpeedLevel) => void;
  setIsSignedOut: (v: boolean) => void;
  setSetupComplete: (v: boolean) => void;
  setUserName: (name: string) => void;
  setUserGrade: (grade: string) => void;
  loadUserProgress: () => Promise<void>;
  syncProfile: () => Promise<void>;
  resetSession: () => void;
  setLastSession: (
    subject: string,
    emoji: string,
    grade: number,
    personalityId: string
  ) => void;
  updateSubjectProgress: (
    subjectLabel: string,
    grade: number,
    progress: number
  ) => void;
  markFlowCompleted: (subjectLabel: string, grade: number) => void;
  setXP: (xp: number) => void;
  setStreak: (streak: number) => void;
  setSubjectProgress: (progress: Record<string, number>) => void;
  incrementSubjectLesson: (subject: string) => void;
  generateDailyChallenge: () => void;
  completeDailyChallenge: () => void;
  markStreakCelebrated: (streak: number) => void;
  markLevelCelebrated: (level: number) => void;
  unlockAvatar: (emoji: string) => void;
  setUserAvatar: (avatar: string) => void;
  incrementWeekendLessons: () => void;
  incrementNonEnglishLessons: () => void;
  addUniqueSubject: (subject: string) => void;
  incrementTodaysLessons: () => void;
  setConsecutivePerfectQuizzes: (count: number) => void;
  setFastestQuizSeconds: (seconds: number) => void;
  setRetriedAndPassedQuiz: (v: boolean) => void;
  /** Wipe all child-facing data — used by the "Delete my data" flow. */
  resetAll: () => void;
}

type PersistedAppState = Pick<
  AppState,
  | 'selectedLanguage'
  | 'selectedGrade'
  | 'selectedSubject'
  | 'selectedPersonalityId'
  | 'totalSessionSeconds'
  | 'xp'
  | 'streak'
  | 'lastStudyDate'
  | 'lessonsCompleted'
  | 'bestQuizScore'
  | 'unlockedAchievements'
  | 'isDarkMode'
  | 'soundEnabled'
  | 'offlineMode'
  | 'dataSaver'
  | 'notificationsEnabled'
  | 'notificationHour'
  | 'notificationMinute'
  | 'difficulty'
  | 'voiceSpeed'
  | 'isSignedOut'
  | 'setupComplete'
  | 'userName'
  | 'userAvatar'
  | 'userGrade'
  | 'lastSubject'
  | 'lastSubjectEmoji'
  | 'lastGrade'
  | 'lastPersonalityId'
  | 'lastOpenedAt'
  | 'subjectProgress'
  | 'completedFlows'
  | 'subjectLessonsCount'
  | 'dailyChallengeDate'
  | 'dailyChallengeCompleted'
  | 'dailyChallengeSubject'
  | 'dailyChallengeTopic'
  | 'lastCelebratedStreak'
  | 'lastCelebratedLevel'
  | 'unlockedAvatars'
  | 'weekendLessons'
  | 'consecutivePerfectQuizzes'
  | 'fastestQuizSeconds'
  | 'retriedAndPassedQuiz'
  | 'nonEnglishLessons'
  | 'uniqueSubjectsTried'
  | 'todaysLessons'
  | 'todaysLessonsDate'
>;

/**
 * Default values for every state field. Extracted so both the store
 * initialiser and `resetAll` can spread it — guaranteeing they stay
 * in sync when new fields are added.
 */
type AppStateValues = Omit<AppState,
  | 'setLanguage' | 'setGrade' | 'setSubject' | 'setPersonality'
  | 'addMessage' | 'clearMessages' | 'setAILoading' | 'setAppReady'
  | 'startSession' | 'endSession' | 'addXP' | 'updateStreak'
  | 'incrementLessons' | 'updateBestQuizScore' | 'unlockAchievement'
  | 'toggleDarkMode' | 'setSoundEnabled' | 'setOfflineMode' | 'setDataSaver'
  | 'setNotificationsEnabled' | 'setNotificationHour' | 'setNotificationMinute'
  | 'setDifficulty' | 'setVoiceSpeed' | 'setIsSignedOut' | 'setSetupComplete'
  | 'setUserName' | 'setUserGrade' | 'loadUserProgress' | 'syncProfile' | 'resetSession'
  | 'setLastSession' | 'updateSubjectProgress'
  | 'markFlowCompleted' | 'setXP' | 'setStreak' | 'setSubjectProgress'
  | 'incrementSubjectLesson' | 'generateDailyChallenge' | 'completeDailyChallenge'
  | 'markStreakCelebrated' | 'markLevelCelebrated' | 'unlockAvatar' | 'setUserAvatar'
  | 'incrementWeekendLessons' | 'incrementNonEnglishLessons' | 'addUniqueSubject'
  | 'incrementTodaysLessons' | 'setConsecutivePerfectQuizzes' | 'setFastestQuizSeconds'
  | 'setRetriedAndPassedQuiz'
  | 'resetAll'
>;

const initialState: AppStateValues = {
  selectedLanguage: 'en',
  selectedGrade: null,
  selectedSubject: null,
  selectedPersonalityId: DEFAULT_PERSONALITY_ID,
  messages: [],
  isAILoading: false,
  isAppReady: false,
  sessionStartTime: null,
  totalSessionSeconds: 0,
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  lessonsCompleted: 0,
  bestQuizScore: 0,
  unlockedAchievements: [],
  isDarkMode: false,
  soundEnabled: true,
  offlineMode: false,
  dataSaver: false,
  notificationsEnabled: true,
  notificationHour: 16,
  notificationMinute: 0,
  difficulty: 'Medium',
  voiceSpeed: 'Normal',
  isSignedOut: false,
  setupComplete: false,
  userName: '',
  userAvatar: '🦁',
  userGrade: '',
  lastSubject: null,
  lastSubjectEmoji: null,
  lastGrade: null,
  lastPersonalityId: null,
  lastOpenedAt: null,
  subjectProgress: {},
  completedFlows: {},
  subjectLessonsCount: {},
  dailyChallengeDate: '',
  dailyChallengeCompleted: false,
  dailyChallengeSubject: '',
  dailyChallengeTopic: '',
  lastCelebratedStreak: 0,
  lastCelebratedLevel: 0,
  unlockedAvatars: ['🦁', '🐯', '🦊', '🐧', '🦅', '🐬'],
  weekendLessons: 0,
  consecutivePerfectQuizzes: 0,
  fastestQuizSeconds: null,
  retriedAndPassedQuiz: false,
  nonEnglishLessons: 0,
  uniqueSubjectsTried: [],
  todaysLessons: 0,
  todaysLessonsDate: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setLanguage: (lang) => set({ selectedLanguage: lang }),
      // Resetting subject when grade changes prevents wrong content showing for the new grade
      setGrade: (grade) => set({ selectedGrade: grade, selectedSubject: null }),
      setSubject: (subject) => set({ selectedSubject: subject }),
      setPersonality: (id) => set({ selectedPersonalityId: id }),
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...message, id: `${Date.now()}-${Math.random()}`, timestamp: Date.now() },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
      setAILoading: (loading) => set({ isAILoading: loading }),
      setAppReady: (ready) => set({ isAppReady: ready }),
      startSession: () => set({ sessionStartTime: Date.now() }),
      endSession: () =>
        set((state) => {
          if (state.sessionStartTime === null) return {};
          const elapsed = Math.floor((Date.now() - state.sessionStartTime) / 1000);
          return {
            totalSessionSeconds: state.totalSessionSeconds + elapsed,
            sessionStartTime: null,
          };
        }),
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const last = state.lastStudyDate;

          if (last === today) return {};

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const newStreak = last === yesterdayStr ? state.streak + 1 : 1;
          return {
            streak: newStreak,
            lastStudyDate: today,
          };
        }),
      incrementLessons: () =>
        set((state) => ({
          lessonsCompleted: state.lessonsCompleted + 1,
        })),
      updateBestQuizScore: (score) =>
        set((state) => ({
          bestQuizScore: Math.max(state.bestQuizScore, score),
        })),
      unlockAchievement: (id) =>
        set((state) => ({
          unlockedAchievements: state.unlockedAchievements.includes(id)
            ? state.unlockedAchievements
            : [...state.unlockedAchievements, id],
        })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setOfflineMode: (v) => set({ offlineMode: v }),
      setDataSaver: (v) => set({ dataSaver: v }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setNotificationHour: (hour) => set({ notificationHour: hour }),
      setNotificationMinute: (minute) => set({ notificationMinute: minute }),
      setDifficulty: (v) => set({ difficulty: v }),
      setVoiceSpeed: (v) => set({ voiceSpeed: v }),
      setIsSignedOut: (v) => set({ isSignedOut: v }),
      setSetupComplete: (v) => set({ setupComplete: v }),
      setUserName: (name) => set({ userName: name }),
      setUserGrade: (grade) => set({ userGrade: grade }),
      loadUserProgress: async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (error || !profile) {
            console.error(
              '[loadUserProgress] Error:',
              error?.message
            );
            return;
          }

          console.log(
            '[loadUserProgress] Raw DB:',
            JSON.stringify({
              xp: profile.xp,
              streak: profile.streak,
              lessons: profile.lessons_completed,
              grade: profile.grade,
              name: profile.name,
              avatar: profile.avatar,
            })
          );

          const local = get();
          const isNewDevice =
            local.xp === 0 &&
            local.lessonsCompleted === 0 &&
            !local.setupComplete;

          const gradeStr = profile.grade
            ? `Primary ${profile.grade}`
            : '';

          const mergedAchievements = [
            ...new Set([
              ...(local.unlockedAchievements ?? []),
              ...(profile.unlocked_achievements ?? []),
            ]),
          ];

          const mergedAvatars = [
            ...new Set([
              ...(local.unlockedAvatars ?? []),
              ...(profile.unlocked_avatars ?? []),
            ]),
          ];

          const gradeNum =
            typeof profile.grade === 'number'
              ? profile.grade
              : parseInt(String(profile.grade ?? ''), 10) || 0;

          const { data: progressRows } = await supabase
            .from('progress')
            .select('subject, grade, score')
            .eq('user_id', user.id);

          const remoteSubjectProgress: Record<string, number> = {};
          if (progressRows) {
            for (const row of progressRows) {
              const key = `${row.subject}_${row.grade}`;
              const existing = remoteSubjectProgress[key] ?? 0;
              if ((row.score ?? 0) > existing) {
                remoteSubjectProgress[key] = row.score ?? 0;
              }
            }
          }

          set({
            xp: isNewDevice
              ? (profile.xp ?? 0)
              : Math.max(local.xp, profile.xp ?? 0),
            streak: isNewDevice
              ? (profile.streak ?? 0)
              : Math.max(local.streak, profile.streak ?? 0),
            lessonsCompleted: isNewDevice
              ? (profile.lessons_completed ?? 0)
              : Math.max(
                  local.lessonsCompleted,
                  profile.lessons_completed ?? 0
                ),
            userName: profile.name?.trim() || local.userName,
            userGrade: gradeStr || local.userGrade,
            userAvatar: profile.avatar?.trim() || local.userAvatar,
            selectedLanguage:
              (profile.language as LanguageCode) || local.selectedLanguage,
            selectedPersonalityId:
              profile.personality_id || local.selectedPersonalityId,
            lastStudyDate:
              profile.last_active_date || local.lastStudyDate,
            unlockedAchievements: mergedAchievements,
            unlockedAvatars: mergedAvatars,
            setupComplete: !!profile.grade || local.setupComplete,
            ...(gradeNum >= 1 && gradeNum <= 6
              ? { selectedGrade: gradeNum }
              : {}),
            ...(Object.keys(remoteSubjectProgress).length > 0
              ? {
                  subjectProgress: isNewDevice
                    ? remoteSubjectProgress
                    : {
                        ...remoteSubjectProgress,
                        ...local.subjectProgress,
                      },
                }
              : {}),
          });

          console.log('[loadUserProgress] ✅ Restored:', {
            xp: get().xp,
            streak: get().streak,
            lessons: get().lessonsCompleted,
            grade: get().userGrade,
          });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          console.error('[loadUserProgress] Exception:', message);
        }
      },
      syncProfile: async () => {
        await syncProfileToDb();
      },
      resetSession: () =>
        set({
          messages: [],
          isAILoading: false,
          sessionStartTime: null,
          selectedSubject: null,
          lastSubject: null,
          lastSubjectEmoji: null,
          lastGrade: null,
          lastPersonalityId: null,
          lastOpenedAt: null,
        }),
      setLastSession: (subject, emoji, grade, personalityId) =>
        set({
          lastSubject: subject,
          lastSubjectEmoji: emoji,
          lastGrade: grade,
          lastPersonalityId: personalityId,
          lastOpenedAt: new Date().toISOString(),
        }),
      updateSubjectProgress: (subjectLabel, grade, progress) =>
        set((state) => {
          const key = `${subjectLabel}_${grade}`;
          const current = state.subjectProgress[key] ?? 0;
          return {
            subjectProgress: {
              ...state.subjectProgress,
              [key]: Math.min(100, Math.max(current, progress)),
            },
          };
        }),
      markFlowCompleted: (subjectLabel, grade) =>
        set((state) => ({
          completedFlows: {
            ...state.completedFlows,
            [`${subjectLabel}_${grade}`]: true,
          },
        })),
      setXP: (xp) => set({ xp }),
      setStreak: (streak) => set({ streak }),
      setSubjectProgress: (subjectProgress) => set({ subjectProgress }),
      incrementSubjectLesson: (subject) =>
        set((state) => ({
          subjectLessonsCount: {
            ...state.subjectLessonsCount,
            [subject]: (state.subjectLessonsCount[subject] ?? 0) + 1,
          },
        })),
      generateDailyChallenge: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.dailyChallengeDate === today) return state;

          const subjects = [
            'English Studies',
            'Mathematics',
            'Basic Science',
            'Social & Citizenship Studies',
            'Civic Education',
          ];
          const topics = [
            'Key Concepts',
            'Practice Problems',
            'Quick Quiz',
            'Fun Facts',
            'Brain Teaser',
          ];

          const subject =
            subjects[Math.floor(Math.random() * subjects.length)];
          const topic = topics[Math.floor(Math.random() * topics.length)];

          return {
            dailyChallengeDate: today,
            dailyChallengeCompleted: false,
            dailyChallengeSubject: subject,
            dailyChallengeTopic: topic,
          };
        }),
      completeDailyChallenge: () => set({ dailyChallengeCompleted: true }),
      markStreakCelebrated: (streak) => set({ lastCelebratedStreak: streak }),
      markLevelCelebrated: (level) => set({ lastCelebratedLevel: level }),
      unlockAvatar: (emoji) =>
        set((state) => ({
          unlockedAvatars: state.unlockedAvatars.includes(emoji)
            ? state.unlockedAvatars
            : [...state.unlockedAvatars, emoji],
        })),
      setUserAvatar: (avatar) => set({ userAvatar: avatar }),
      incrementWeekendLessons: () =>
        set((state) => ({ weekendLessons: state.weekendLessons + 1 })),
      incrementNonEnglishLessons: () =>
        set((state) => ({ nonEnglishLessons: state.nonEnglishLessons + 1 })),
      addUniqueSubject: (subject) =>
        set((state) => ({
          uniqueSubjectsTried: state.uniqueSubjectsTried.includes(subject)
            ? state.uniqueSubjectsTried
            : [...state.uniqueSubjectsTried, subject],
        })),
      incrementTodaysLessons: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const count =
            state.todaysLessonsDate === today ? state.todaysLessons + 1 : 1;
          return { todaysLessons: count, todaysLessonsDate: today };
        }),
      setConsecutivePerfectQuizzes: (count) =>
        set({ consecutivePerfectQuizzes: count }),
      setFastestQuizSeconds: (seconds) => set({ fastestQuizSeconds: seconds }),
      setRetriedAndPassedQuiz: (v) => set({ retriedAndPassedQuiz: v }),
      resetAll: () => set({ ...initialState }),
    }),
    {
      name: 'learnova-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: true,
      // Persist language, grade, subject, and accumulated study time. Messages are excluded:
      // they grow large, may contain personal chat, and each lesson should start fresh.
      partialize: (state): PersistedAppState => ({
        selectedLanguage: state.selectedLanguage,
        selectedGrade: state.selectedGrade,
        selectedSubject: state.selectedSubject,
        selectedPersonalityId: state.selectedPersonalityId,
        totalSessionSeconds: state.totalSessionSeconds,
        xp: state.xp,
        streak: state.streak,
        lastStudyDate: state.lastStudyDate,
        lessonsCompleted: state.lessonsCompleted,
        bestQuizScore: state.bestQuizScore,
        unlockedAchievements: state.unlockedAchievements,
        isDarkMode: state.isDarkMode,
        soundEnabled: state.soundEnabled,
        offlineMode: state.offlineMode,
        dataSaver: state.dataSaver,
        notificationsEnabled: state.notificationsEnabled,
        notificationHour: state.notificationHour,
        notificationMinute: state.notificationMinute,
        difficulty: state.difficulty,
        voiceSpeed: state.voiceSpeed,
        isSignedOut: state.isSignedOut,
        setupComplete: state.setupComplete,
        userName: state.userName,
        userAvatar: state.userAvatar,
        userGrade: state.userGrade,
        lastSubject: state.lastSubject,
        lastSubjectEmoji: state.lastSubjectEmoji,
        lastGrade: state.lastGrade,
        lastPersonalityId: state.lastPersonalityId,
        lastOpenedAt: state.lastOpenedAt,
        subjectProgress: state.subjectProgress,
        completedFlows: state.completedFlows,
        subjectLessonsCount: state.subjectLessonsCount,
        dailyChallengeDate: state.dailyChallengeDate,
        dailyChallengeCompleted: state.dailyChallengeCompleted,
        dailyChallengeSubject: state.dailyChallengeSubject,
        dailyChallengeTopic: state.dailyChallengeTopic,
        lastCelebratedStreak: state.lastCelebratedStreak,
        lastCelebratedLevel: state.lastCelebratedLevel,
        unlockedAvatars: state.unlockedAvatars,
        weekendLessons: state.weekendLessons,
        consecutivePerfectQuizzes: state.consecutivePerfectQuizzes,
        fastestQuizSeconds: state.fastestQuizSeconds,
        retriedAndPassedQuiz: state.retriedAndPassedQuiz,
        nonEnglishLessons: state.nonEnglishLessons,
        uniqueSubjectsTried: state.uniqueSubjectsTried,
        todaysLessons: state.todaysLessons,
        todaysLessonsDate: state.todaysLessonsDate,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as PersistedAppState),
        messages: [],
        isAILoading: false,
        isAppReady: false,
        sessionStartTime: null,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('Hydration error:', error);
          }
          useAppStore.getState().setAppReady(true);
        };
      },
    }
  )
);
