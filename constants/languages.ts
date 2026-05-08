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
  en: 'Respond only in clear, simple English suitable for Nigerian primary school students.',
  yo: 'Dahun ni Yorùbá péré. Lo ọrọ̀ tó rọrùn fún àwọn ọmọ ilé ẹ̀kọ́ alakọbẹrẹ ní Naijiria.',
  ig: 'Zaa naanị n’asụsụ Igbo. Jiri okwu dị mfe maka ụmụ akwụkwọ praịmarị na Naịjịrịa.',
  ha: 'Amsa da Hausa kawai. Yi amfani da kalmomi masu sauki ga daliban firamare a Najeriya.',
};

type UIStrings = {
  appName: string;
  chooseLanguage: string;
  classQuestion: string;
  classSubtitle: string;
  selectClass: string;
  subjects: string;
  languages: string;
  lifeSkills: string;
  lifeSkillsTitle: string;
  lifeSkillsText: string;
  quiz: string;
  quizMode: string;
  askPlaceholder: string;
  thinking: string;
  primary: string;
  languageLabel: string;
  learn: string;
  practice: string;
  quizAction: string;
  story: string;
  teacherPrompt: string;
};

export const UI_TEXT: Record<LanguageCode, UIStrings> = {
  en: {
    appName: 'Learnova',
    chooseLanguage: 'Choose your language to begin:',
    classQuestion: 'What class are you in?',
    classSubtitle: 'Select your Nigerian primary school class',
    selectClass: 'Select Your Class',
    subjects: 'Subjects',
    languages: 'Languages',
    lifeSkills: 'Life Skills',
    lifeSkillsTitle: 'Life Skills Programme',
    lifeSkillsText: 'These skills help you succeed in life beyond the classroom.',
    quiz: 'Quiz',
    quizMode: 'Quiz Mode',
    askPlaceholder: 'Ask your teacher anything...',
    thinking: 'Thinking...',
    primary: 'Primary',
    languageLabel: 'Language',
    learn: 'Learn',
    practice: 'Practice',
    quizAction: 'Quiz',
    story: 'Story',
    teacherPrompt: 'Your friendly AI teacher',
  },
  yo: {
    appName: 'Learnova',
    chooseLanguage: 'Yan èdè rẹ láti bẹ̀rẹ̀:',
    classQuestion: 'Kíláàsì wo lo wà?',
    classSubtitle: 'Yan kíláàsì alakọbẹrẹ rẹ ní Naijiria',
    selectClass: 'Yan Kíláàsì Rẹ',
    subjects: 'Kókó Ẹ̀kọ́',
    languages: 'Àwọn Èdè',
    lifeSkills: 'Ọgbọ́n Ìgbésí Ayé',
    lifeSkillsTitle: 'Ètò Ọgbọ́n Ìgbésí Ayé',
    lifeSkillsText: 'Ọgbọ́n wọ̀nyí máa ràn ọ́ lọ́wọ́ láti ṣàṣeyọrí ní ìgbésí ayé.',
    quiz: 'Ìdánwò',
    quizMode: 'Ipò Ìdánwò',
    askPlaceholder: 'Bi olùkọ́ rẹ ní ìbéèrè...',
    thinking: 'Mo ń ronú...',
    primary: 'Primary',
    languageLabel: 'Èdè',
    learn: 'Kọ́',
    practice: 'Ṣe àdánwò',
    quizAction: 'Dánwò',
    story: 'Ìtàn',
    teacherPrompt: 'Olùkọ́ AI ọ̀rẹ́ rẹ',
  },
  ig: {
    appName: 'Learnova',
    chooseLanguage: 'Họrọ asụsụ gị ka ịmalite:',
    classQuestion: 'Klaasị ole ka ị nọ?',
    classSubtitle: 'Họrọ klaasị praịmarị gị na Naịjịrịa',
    selectClass: 'Họrọ Klaasị Gị',
    subjects: 'Isiokwu',
    languages: 'Asụsụ',
    lifeSkills: 'Nka Ndụ',
    lifeSkillsTitle: 'Mmemme Nka Ndụ',
    lifeSkillsText: 'Nka ndị a na-enyere gị aka ịga nke ọma karịa klas.',
    quiz: 'Ajụjụ Ule',
    quizMode: 'Ụdị Ule',
    askPlaceholder: 'Jụọ onye nkuzi gị ihe ọ bụla...',
    thinking: 'Ana m eche...',
    primary: 'Primary',
    languageLabel: 'Asụsụ',
    learn: 'Mụta',
    practice: 'Mee Omume',
    quizAction: 'Nwale',
    story: 'Akụkọ',
    teacherPrompt: 'Onye nkuzi AI enyi gị',
  },
  ha: {
    appName: 'Learnova',
    chooseLanguage: 'Zaɓi harshenka don farawa:',
    classQuestion: 'Wane aji kake?',
    classSubtitle: 'Zaɓi ajin firamare naka a Najeriya',
    selectClass: 'Zaɓi Ajinka',
    subjects: 'Darussa',
    languages: 'Harsuna',
    lifeSkills: 'Kwarewar Rayuwa',
    lifeSkillsTitle: 'Shirin Kwarewar Rayuwa',
    lifeSkillsText: 'Wadannan kwarewa na taimaka maka ka yi nasara a rayuwa.',
    quiz: 'Gwaji',
    quizMode: 'Yanayin Gwaji',
    askPlaceholder: 'Tambayi malamin ka komai...',
    thinking: 'Ina tunani...',
    primary: 'Primary',
    languageLabel: 'Harshen',
    learn: 'Koya',
    practice: 'Aiki',
    quizAction: 'Gwada',
    story: 'Labarin',
    teacherPrompt: 'Malamin AI na abokinka',
  },
};

export const getUIText = (langCode: LanguageCode): UIStrings => UI_TEXT[langCode];

export const getGreeting = (
  langCode: LanguageCode,
  subject: string,
  grade: number
): string => {
  const greetings: Record<LanguageCode, string> = {
    en: `Hello! I am your Learnova AI teacher. Let us learn ${subject} for Primary ${grade}. What would you like to start with?`,
    yo: `Ẹ káàbọ̀! Mo jẹ olùkọ́ AI rẹ ní Learnova. Jẹ́ ká kọ́ ${subject} fún Primary ${grade}. Kí ni o fẹ́ bẹ̀rẹ̀ pẹ̀lú?`,
    ig: `Nnọọ! Abụ m onye nkuzi AI gị na Learnova. Ka anyị mụta ${subject} maka Primary ${grade}. Gịnị ka ị chọrọ ibido?`,
    ha: `Sannu! Ni ne malamin AI ɗinka a Learnova. Mu koya ${subject} don Primary ${grade}. Me kake son fara da shi?`,
  };
  return greetings[langCode];
};