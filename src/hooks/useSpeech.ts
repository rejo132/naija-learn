/**
 * useSpeech — Text-to-Speech for Learnova.
 *
 * Wraps `expo-speech` for cross-platform TTS (iOS, Android, Web).
 * Strips Markdown before speaking and falls back to Nigerian English
 * when the requested locale is unavailable.
 */
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export type VoiceLanguage = 'en' | 'ha' | 'yo' | 'ig';

const SPEECH_LOCALES: Record<VoiceLanguage, string> = {
  en: 'en-NG',
  ha: 'ha',
  yo: 'yo',
  ig: 'ig',
};

const FALLBACK_LOCALE = 'en-NG';

function cleanForSpeech(input: string): string {
  return input
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\n+/g, '. ')
    .replace(/[*_~`#]/g, '')
    .trim();
}

export function useSpeech(language: VoiceLanguage = 'en') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const speak = useCallback(
    async (text: string) => {
      try {
        await Speech.stop();

        const cleaned = cleanForSpeech(text);
        if (!cleaned) return;

        const locale = SPEECH_LOCALES[language] ?? FALLBACK_LOCALE;

        setIsSpeaking(true);

        Speech.speak(cleaned, {
          language: locale,
          pitch: 1.0,
          rate: Platform.OS === 'web' ? 0.9 : 0.85,
          onStart: () => setIsSpeaking(true),
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => {
            setIsSpeaking(false);
            if (locale !== FALLBACK_LOCALE) {
              Speech.speak(cleaned, {
                language: FALLBACK_LOCALE,
                pitch: 1.0,
                rate: 0.85,
                onDone: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
              });
            }
          },
        });
      } catch {
        setIsSpeaking(false);
        setIsSupported(false);
      }
    },
    [language]
  );

  const stop = useCallback(async () => {
    try {
      await Speech.stop();
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const toggle = useCallback(
    async (text: string) => {
      if (isSpeaking) {
        await stop();
      } else {
        await speak(text);
      }
    },
    [isSpeaking, speak, stop]
  );

  return { speak, stop, toggle, isSpeaking, isSupported };
}
