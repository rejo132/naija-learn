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
  | 'lastSubject'
  | 'lastSubjectEmoji'
  | 'lastGrade'
  | 'lastPersonalityId'
  | 'lastOpenedAt'
  | 'subjectProgress'
  | 'completedFlows'
>;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
      lastSubject: null,
      lastSubjectEmoji: null,
      lastGrade: null,
      lastPersonalityId: null,
      lastOpenedAt: null,
      subjectProgress: {},
      completedFlows: {},
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
      resetAll: () =>
        set({
          xp: 0,
          streak: 0,
          lastStudyDate: null,
          lessonsCompleted: 0,
          bestQuizScore: 0,
          unlockedAchievements: [],
          lastSubject: null,
          lastSubjectEmoji: null,
          lastGrade: null,
          lastPersonalityId: null,
          lastOpenedAt: null,
          subjectProgress: {},
          completedFlows: {},
          selectedGrade: null,
          selectedLanguage: 'en',
          selectedSubject: null,
          isDarkMode: false,
          messages: [],
          totalSessionSeconds: 0,
        }),
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
        lastSubject: state.lastSubject,
        lastSubjectEmoji: state.lastSubjectEmoji,
        lastGrade: state.lastGrade,
        lastPersonalityId: state.lastPersonalityId,
        lastOpenedAt: state.lastOpenedAt,
        subjectProgress: state.subjectProgress,
        completedFlows: state.completedFlows,
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
        return (state, error) => {
          if (error) {
            console.error('Hydration error:', error);
          }
          // state may be undefined if storage was empty — mark ready either way
          useAppStore.getState().setAppReady(true);
        };
      },
    }
  )
);
