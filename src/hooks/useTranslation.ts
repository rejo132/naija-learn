import { useAppStore } from '@/store/appStore';
import { t, type Language, type UITextKey } from '@/constants/languages';

export function useTranslation() {
  const selectedLanguage = useAppStore((s) => s.selectedLanguage) as Language;

  return {
    t: (key: UITextKey) => t(key, selectedLanguage ?? 'en'),
    language: selectedLanguage ?? 'en',
  };
}
