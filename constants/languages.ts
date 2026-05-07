export type LanguageCode = 'en' | 'yo' | 'ig' | 'ha';

export interface Language {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  greeting: string;
  color: string;
  region: string;
}

export const LANGUAGES: Language[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    greeting: 'Welcome!',
    color: '#1a6b3c',
    region: 'Nigeria (National)',
  },
  {
    code: 'yo',
    label: 'Yoruba',
    nativeLabel: 'Yorùbá',
    greeting: 'Ẹ káàbọ̀!',
    color: '#d97706',
    region: 'Southwest Nigeria',
  },
  {
    code: 'ig',
    label: 'Igbo',
    nativeLabel: 'Igbo',
    greeting: 'Nnọọ!',
    color: '#7c3aed',
    region: 'Southeast Nigeria',
  },
  {
    code: 'ha',
    label: 'Hausa',
    nativeLabel: 'Hausa',
    greeting: 'Sannu!',
    color: '#dc2626',
    region: 'Northern Nigeria',
  },
];

export const LANGUAGE_PROMPTS: Record<LanguageCode, string> = {
  en: 'Respond in clear, simple English suitable for Nigerian primary school students.',
  yo: 'Respond primarily in Yorùbá with English explanations in brackets. Use simple language for Nigerian primary school children.',
  ig: 'Respond primarily in Igbo with English explanations in brackets. Use simple language for Nigerian primary school children.',
  ha: 'Respond primarily in Hausa with English explanations in brackets. Use simple language for Nigerian primary school children.',
};

export const getGreeting = (
  langCode: LanguageCode,
  subject: string,
  grade: number
): string => {
  const greetings: Record<LanguageCode, string> = {
    en: `Hello! I am your NaijaLearn AI teacher. Let us learn ${subject} for Primary ${grade}. What would you like to start with?`,
    yo: `Ẹ káàbọ̀! Mo jẹ olùkọ rẹ NaijaLearn. Jẹ ká kọ ${subject} fún Primary ${grade}. Kíni o fẹ kọ?`,
    ig: `Nnọọ! Abụ m onye nkuzi gị NaijaLearn. Ka anyị mụọ ${subject} maka Primary ${grade}. Gịnị ka ịchọrọ ibido?`,
    ha: `Sannu! Ni ne malaminku na NaijaLearn. Bari mu koya ${subject} don Primary ${grade}. Me kake son farawa?`,
  };
  return greetings[langCode];
};