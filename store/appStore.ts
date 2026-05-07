import { create } from 'zustand';
import { LanguageCode } from '@/constants/languages';
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
  messages: ChatMessage[];
  isAILoading: boolean;
  setLanguage: (lang: LanguageCode) => void;
  setGrade: (grade: number) => void;
  setSubject: (subject: Subject) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setAILoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedLanguage: 'en',
  selectedGrade: null,
  selectedSubject: null,
  messages: [],
  isAILoading: false,
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  setGrade: (grade) => set({ selectedGrade: grade }),
  setSubject: (subject) => set({ selectedSubject: subject }),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: `${Date.now()}-${Math.random()}`, timestamp: Date.now() },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  setAILoading: (loading) => set({ isAILoading: loading }),
}));