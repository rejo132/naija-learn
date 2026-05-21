/**
 * Curriculum data, grading scale, and lesson prompt helpers.
 *
 * @remarks
 * **Responsible for:** Subject catalogs (core, languages, life skills), grade-band
 * filtering, NERDC A–F scale, localized subject labels, pre-vocational trade areas,
 * and quick-action / quiz prompt strings for the lesson screen.
 *
 * **Talks to:**
 * - Imports: `LanguageCode` type from `@/constants/languages`.
 * - Exports: `Subject`, subject arrays, `getCoreSubjectsForGrade`, `NIGERIAN_GRADES`,
 *   `getNigerianGrade`, `getLocalizedSubject`, `PREVOCATIONAL_TRADE_AREAS`,
 *   `getLessonQuickActions`, `getQuickPrompts`, and related types.
 * - Imported by: `app/grade.tsx`, `dashboard.tsx`, `lesson.tsx`, `@/store/appStore`.
 *
 * **Notes for new developers:**
 * - Core subjects use `minGrade` / `maxGrade` (e.g. Basic Science vs Science & Tech).
 * - `SUBJECT_TRANSLATIONS` only covers `yo`, `ig`, `ha`; English uses base labels.
 * - Pre-vocational quick actions replace the default four prompts when
 *   `subjectId === 'prevocational'`.
 * - Curriculum copy references FG/NERDC 2025/26 — verify against official docs when updating.
 */
import type { LanguageCode } from '@/constants/languages';

export interface Subject {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  category: 'core' | 'language' | 'softskill';
  description: string;
  /** First primary grade this subject appears (default 1). */
  minGrade?: number;
  /** Last primary grade this subject appears (default 6). */
  maxGrade?: number;
}

/** FG revised national curriculum (2025/26) — Primary 1–6 core subjects. */
export const CORE_SUBJECTS: Subject[] = [
  { id: 'english', label: 'English Studies', icon: '📖', color: '#1d4ed8', bgColor: '#dbeafe', category: 'core', description: 'Reading, writing and grammar' },
  { id: 'math', label: 'Mathematics', icon: '🔢', color: '#1a6b3c', bgColor: '#d1fae5', category: 'core', description: 'Numbers, shapes and problem solving' },
  { id: 'science', label: 'Basic Science', icon: '🔬', color: '#7c3aed', bgColor: '#ede9fe', category: 'core', description: 'Explore the natural world', minGrade: 1, maxGrade: 3 },
  { id: 'science_tech', label: 'Basic Science & Technology', icon: '🔬', color: '#7c3aed', bgColor: '#ede9fe', category: 'core', description: 'Science, technology and innovation', minGrade: 4, maxGrade: 6 },
  { id: 'physical_health', label: 'Physical & Health Education', icon: '⚽', color: '#059669', bgColor: '#d1fae5', category: 'core', description: 'Fitness, sport and healthy living' },
  { id: 'religious', label: 'CRS / Islamic Studies', icon: '🕌', color: '#0f766e', bgColor: '#ccfbf1', category: 'core', description: 'Christian or Islamic religious education' },
  { id: 'nigerian_history', label: 'Nigerian History', icon: '📜', color: '#b45309', bgColor: '#fef3c7', category: 'core', description: 'Nigeria’s past, heroes and heritage' },
  { id: 'social_citizenship', label: 'Social & Citizenship Studies', icon: '🌍', color: '#d97706', bgColor: '#fef3c7', category: 'core', description: 'Community, rights and good citizenship' },
  { id: 'cca', label: 'Cultural & Creative Arts', icon: '🎨', color: '#db2777', bgColor: '#fce7f3', category: 'core', description: 'Music, art, drama and culture' },
  { id: 'prevocational', label: 'Pre-vocational Studies', icon: '🛠️', color: '#0369a1', bgColor: '#e0f2fe', category: 'core', description: 'Solar, fashion, farming, beauty, tech & crops', minGrade: 1, maxGrade: 3 },
  { id: 'digital_literacy', label: 'Basic Digital Literacy', icon: '💻', color: '#0369a1', bgColor: '#e0f2fe', category: 'core', description: 'Computers, internet and digital safety', minGrade: 4, maxGrade: 6 },
  { id: 'french', label: 'French (Optional)', icon: '🇫🇷', color: '#1e40af', bgColor: '#dbeafe', category: 'core', description: 'Introductory French language', minGrade: 1, maxGrade: 6 },
  { id: 'arabic', label: 'Arabic (Optional)', icon: '📿', color: '#047857', bgColor: '#d1fae5', category: 'core', description: 'Introductory Arabic language', minGrade: 1, maxGrade: 6 },
];

export const LANGUAGE_SUBJECTS: Subject[] = [
  { id: 'yoruba', label: 'Yorùbá Language', icon: '🗣️', color: '#b45309', bgColor: '#fef9c3', category: 'language', description: 'Southwest Nigerian language' },
  { id: 'igbo', label: 'Igbo Language', icon: '🗣️', color: '#6d28d9', bgColor: '#f3e8ff', category: 'language', description: 'Southeast Nigerian language' },
  { id: 'hausa', label: 'Hausa Language', icon: '🗣️', color: '#991b1b', bgColor: '#fee2e2', category: 'language', description: 'Northern Nigerian language' },
];

export const SOFT_SKILLS: Subject[] = [
  { id: 'confidence', label: 'Confidence Building', icon: '🏆', color: '#d97706', bgColor: '#fef3c7', category: 'softskill', description: 'Believe in yourself!' },
  { id: 'hygiene', label: 'Hygiene Development', icon: '🧼', color: '#0f766e', bgColor: '#ccfbf1', category: 'softskill', description: 'Build clean and healthy habits' },
  { id: 'communication', label: 'Communication', icon: '💬', color: '#7c3aed', bgColor: '#ede9fe', category: 'softskill', description: 'Speak and listen well' },
  { id: 'leadership', label: 'Leadership', icon: '👑', color: '#dc2626', bgColor: '#fee2e2', category: 'softskill', description: 'Lead and inspire others' },
  { id: 'teamwork', label: 'Teamwork', icon: '🤝', color: '#1d4ed8', bgColor: '#dbeafe', category: 'softskill', description: 'Work together to win' },
  { id: 'creativity', label: 'Creativity', icon: '💡', color: '#ea580c', bgColor: '#ffedd5', category: 'softskill', description: 'Think outside the box!' },
];

export const getCoreSubjectsForGrade = (grade: number): Subject[] =>
  CORE_SUBJECTS.filter(
    (s) => grade >= (s.minGrade ?? 1) && grade <= (s.maxGrade ?? 6)
  );

export interface Grade {
  min: number;
  max: number;
  grade: string;
  remark: string;
  color: string;
  bgColor: string;
}

export const NIGERIAN_GRADES: Grade[] = [
  { min: 75, max: 100, grade: 'A', remark: 'Excellent',  color: '#166534', bgColor: '#dcfce7' },
  { min: 65, max: 74,  grade: 'B', remark: 'Very Good',  color: '#1d4ed8', bgColor: '#dbeafe' },
  { min: 55, max: 64,  grade: 'C', remark: 'Good',       color: '#7c3aed', bgColor: '#ede9fe' },
  { min: 45, max: 54,  grade: 'D', remark: 'Pass',       color: '#d97706', bgColor: '#fef3c7' },
  { min: 0,  max: 44,  grade: 'F', remark: 'Fail',       color: '#dc2626', bgColor: '#fee2e2' },
];

export const getNigerianGrade = (score: number): Grade =>
  NIGERIAN_GRADES.find((g) => score >= g.min && score <= g.max) ?? NIGERIAN_GRADES[4];

const SUBJECT_TRANSLATIONS: Record<LanguageCode, Record<string, { label: string; description: string }>> = {
  en: {},
  yo: {
    english: { label: 'Ẹ̀kọ́ Gẹ̀ẹ́sì', description: 'Kíkà, kíkọ àti grama' },
    math: { label: 'Mátimatiki', description: 'Nọ́ńbà, àwòrán àti yíyọ̀ síṣe' },
    science: { label: 'Sáyẹ́nsì Alákọ̀bẹrẹ', description: 'Ṣàwárí ayé àdáyébá' },
    science_tech: { label: 'Sáyẹ́nsì & Tẹ́knọ́lọ́jì', description: 'Sáyẹ́nsì, tẹ́knọ́lọ́jì àti ìmọ̀ ẹ̀rọ' },
    physical_health: { label: 'Ẹ̀kọ́ Ara & Ìlera', description: 'Idaraya, eré àti ìgbésí ayé tó dára' },
    religious: { label: 'Ẹ̀kọ́ Ẹ̀sìn', description: 'Ẹ̀kọ́ ẹ̀sìn Kírístì tàbí Islam' },
    nigerian_history: { label: 'Ìtàn Naijiria', description: 'Ìtàn Naijiria, àwọn akẹ́kọ̀ọ́ àti àṣà' },
    social_citizenship: { label: 'Àwùjọ & Ọmọ Orílẹ̀-èdè', description: 'Àwùjọ, ẹ̀tọ́ àti ìṣe àgbàye tó dára' },
    cca: { label: 'Àṣà & Ọ̀nà Ìṣẹ̀dá', description: 'Orin, aworan, eré àti àṣà' },
    prevocational: { label: 'Ẹ̀kọ́ Ọ̀ṣẹ́ Alákọ̀bẹrẹ', description: 'Solar, aṣọ, ọgbìn, ẹ̀wà, tẹ́knọ́lọ́jì àti ẹ̀so' },
    digital_literacy: { label: 'Ìmọ̀ Díjítàlì Alákọ̀bẹrẹ', description: 'Kọ̀m̀pútà, íńtánẹ́ẹ̀tì àti ààbò' },
    french: { label: 'Faransé (Àṣàyàn)', description: 'Èdè Faransé àkọ́kọ́' },
    arabic: { label: 'Lárúbáwá (Àṣàyàn)', description: 'Èdè Lárúbáwá àkọ́kọ́' },
    yoruba: { label: 'Èdè Yorùbá', description: 'Èdè agbègbè ìwọ̀-oòrùn Naijiria' },
    igbo: { label: 'Èdè Igbo', description: 'Èdè agbègbè ìlà-oòrùn Naijiria' },
    hausa: { label: 'Èdè Hausa', description: 'Èdè agbègbè àríwá Naijiria' },
    confidence: { label: 'Ìgboyà Ara Rẹ', description: 'Gbagbọ́ nínú ara rẹ!' },
    hygiene: { label: 'Ìdàgbàsókè Imótótó', description: 'Kọ ìṣe mímọ́ àti ìlera' },
    communication: { label: 'Ìbánisọ̀rọ̀', description: 'Sọ̀rọ̀ dáadáa, gbọ́ dáadáa' },
    leadership: { label: 'Olórí', description: 'Darí kí o sì mú ẹlòmíràn lárugẹ' },
    teamwork: { label: 'Ìfọwọ́sowọ́pọ̀', description: 'Ṣiṣẹ́ pọ̀ láti ṣàṣeyọrí' },
    creativity: { label: 'Ìṣẹ̀dá', description: 'Ronú ní ọ̀nà tuntun' },
  },
  ig: {
    english: { label: 'Ọmụmụ Bekee', description: 'Ịgụ, ide na grama' },
    math: { label: 'Mgbakọ na Mwepụ', description: 'Nọmba, ụdị na mwepụ ihe' },
    science: { label: 'Sayensị Isi', description: 'Chọpụta ụwa ndụ' },
    science_tech: { label: 'Sayensị & Teknụzụ', description: 'Sayensị, teknụzụ na ihe ọhụrụ' },
    physical_health: { label: 'Mmụta Ahụike & Anụ Ahụ', description: 'Ahụike, egwuregwu na ịdị mma' },
    religious: { label: 'Ọmụmụ Okpukpe', description: 'Ọmụmụ okpukpe Kraịst ma ọ bụ Islam' },
    nigerian_history: { label: 'Akụkọ Ihe Mere Naịjịrịa', description: 'Ihe mere eme Naịjịrịa na omenala' },
    social_citizenship: { label: 'Ọha & Ọmụmụ Nwa Amaala', description: 'Obodo, ikike na ọrụ ọma' },
    cca: { label: 'Omenala & Ọnụọgụgụ', description: 'Egwu, osise, ihe nkiri na omenala' },
    prevocational: { label: 'Ọrụ Ọkachamara Mbido', description: 'Solar, akwa, ugbo, mma, teknụzụ na ihe ọkụkụ' },
    digital_literacy: { label: 'Ọgụgụ Dijitalụ Mbido', description: 'Kọmputa, ịntanetị na nchekwa' },
    french: { label: 'Asụsụ French (Nhọrọ)', description: 'Mmụta French mbido' },
    arabic: { label: 'Asụsụ Arabic (Nhọrọ)', description: 'Mmụta Arabic mbido' },
    yoruba: { label: 'Asụsụ Yorùbá', description: 'Asụsụ ndịda ọdịda anyanwụ Naịjịrịa' },
    igbo: { label: 'Asụsụ Igbo', description: 'Asụsụ ndịda ọwụwa anyanwụ Naịjịrịa' },
    hausa: { label: 'Asụsụ Hausa', description: 'Asụsụ ugwu Naịjịrịa' },
    confidence: { label: 'Iwulite Obi Ike', description: 'Kwere na onwe gị!' },
    hygiene: { label: 'Mmepe Ịdị Ọcha', description: 'Mụta omume ịdị ọcha na ahụike' },
    communication: { label: 'Nkwurịta Okwu', description: 'Kwuo nke ọma ma gee ntị nke ọma' },
    leadership: { label: 'Onye Ndú', description: 'Duru ma gbaa ndị ọzọ ume' },
    teamwork: { label: 'Ọrụ Otu', description: 'Rụkọọ ọrụ ọnụ ka i merie' },
    creativity: { label: 'Ịmepụta Ihe', description: 'Chee echiche n’ụzọ ọhụrụ' },
  },
  ha: {
    english: { label: 'Karatu Turanci', description: 'Karatu, rubutu da nahawu' },
    math: { label: 'Lissafi', description: 'Lambobi, siffofi da warware matsala' },
    science: { label: 'Kimiyya ta Farko', description: 'Binciki duniyar halitta' },
    science_tech: { label: 'Kimiyya da Fasaha', description: 'Kimiyya, fasaha da sabbin abubuwa' },
    physical_health: { label: 'Motsa Jiki da Lafiya', description: 'Motsa jiki, wasa da rayuwa mai kyau' },
    religious: { label: 'Ilimin Addini', description: 'Ilimin Kirista ko Musulunci' },
    nigerian_history: { label: 'Tarihin Najeriya', description: 'Tarihin Najeriya da al’adu' },
    social_citizenship: { label: 'Zamantakewa da Ɗan Ƙasa', description: 'Al’umma, haƙƙoƙi da kyakkyawan ɗan ƙasa' },
    cca: { label: 'Al’adu da Fasaha', description: 'Waƙa, zane, wasa da al’adu' },
    prevocational: { label: 'Ilimin Sana’a na Farko', description: 'Solar, zane, kiwo, kyau, fasaha da amfanin gona' },
    digital_literacy: { label: 'Ilimin Dijital na Farko', description: 'Kwamfuta, intanet da tsaro' },
    french: { label: 'Faransanci (Zaɓi)', description: 'Koyon Faransanci na farko' },
    arabic: { label: 'Larabci (Zaɓi)', description: 'Koyon Larabci na farko' },
    yoruba: { label: 'Harshen Yarbanci', description: 'Harshen kudu maso yammacin Najeriya' },
    igbo: { label: 'Harshen Ibo', description: 'Harshen kudu maso gabashin Najeriya' },
    hausa: { label: 'Harshen Hausa', description: 'Harshen arewacin Najeriya' },
    confidence: { label: 'Gina Kwarin Gwiwa', description: 'Yarda da kanka!' },
    hygiene: { label: 'Ci gaban Tsafta', description: 'Koyi halayen tsafta da lafiya' },
    communication: { label: 'Sadarwa', description: 'Yi magana da kyau, saurara da kyau' },
    leadership: { label: 'Jagoranci', description: 'Jagoranci ka ƙarfafa wasu' },
    teamwork: { label: 'Aikin Tare', description: 'Ku yi aiki tare don nasara' },
    creativity: { label: 'Kirkira', description: 'Yi tunani ta sabuwar hanya' },
  },
};

export const getLocalizedSubject = (subject: Subject, languageCode: LanguageCode): Subject => {
  const translated = SUBJECT_TRANSLATIONS[languageCode]?.[subject.id];
  if (!translated) return subject;
  return { ...subject, label: translated.label, description: translated.description };
};

/** Six streamlined trade areas from the FG 2025/26 curriculum (introduced in Pre-vocational / JSS). */
export const PREVOCATIONAL_TRADE_AREAS = [
  { id: 'solar', icon: '☀️', en: 'Solar PV Installation & Maintenance', yo: 'Fífitì Solar PV', ig: 'Ntọala Solar PV', ha: 'Shigar da Solar PV' },
  { id: 'fashion', icon: '👗', en: 'Fashion Design & Garment Making', yo: 'Dídà Apárá & Aṣọ', ig: 'Mmecha Ụdị & Akwa', ha: 'Zane & Dinki' },
  { id: 'livestock', icon: '🐄', en: 'Livestock Farming', yo: 'Ọgbìn Ẹranko', ig: 'Ugbo Anụmanụ', ha: 'Kiwo Dabbobi' },
  { id: 'beauty', icon: '💄', en: 'Beauty & Cosmetology', yo: 'Ẹ̀wà & Cosmetology', ig: 'Mma & Cosmetology', ha: 'Kyau & Cosmetology' },
  { id: 'computer_hardware', icon: '📱', en: 'Computer Hardware & GSM Repairs', yo: 'Ẹ̀rọ Kọ̀m̀pútà & GSM', ig: 'Ngwa Kọmputa & GSM', ha: 'Kayan Kwamfuta & GSM' },
  { id: 'horticulture', icon: '🌾', en: 'Horticulture & Crop Production', yo: 'Ọgbìn Ẹ̀so', ig: 'Ugbo Osisi & Ihe Ọkụkụ', ha: 'Gona da Amfanin Gona' },
] as const;

export interface LessonQuickAction {
  icon: string;
  label: string;
  prompt: string;
}

export const getLessonQuickActions = (
  subjectId: string,
  subjectLabel: string,
  grade: number,
  languageCode: LanguageCode
): LessonQuickAction[] => {
  if (subjectId === 'prevocational') {
    const tradePrompt = (tradeName: string): string => {
      const prompts: Record<LanguageCode, string> = {
        en: `Teach me about ${tradeName} for Primary ${grade} Pre-vocational Studies. Use simple, practical examples.`,
        yo: `Kọ́ mi nípa ${tradeName} fún Ẹ̀kọ́ Ọ̀ṣẹ́ Alákọ̀bẹrẹ Primary ${grade}. Lo àpẹẹrẹ tó rọrùn.`,
        ig: `Kụziere m gbasara ${tradeName} maka Ọrụ Ọkachamara Mbido Primary ${grade}. Jiri ihe atụ dị mfe.`,
        ha: `Ka koya mini game da ${tradeName} don Ilimin Sana'a na Farko Primary ${grade}. Yi amfani da misalai masu sauƙi.`,
      };
      return prompts[languageCode];
    };
    return PREVOCATIONAL_TRADE_AREAS.map((trade) => {
      const label = trade[languageCode];
      return { icon: trade.icon, label, prompt: tradePrompt(label) };
    });
  }

  const prompts = getQuickPrompts(subjectLabel, grade, languageCode);
  const labels: Record<LanguageCode, [string, string, string, string]> = {
    en: ['Learn', 'Practice', 'Quiz', 'Story'],
    yo: ['Kọ́', 'Àdánwò', 'Dánwò', 'Ìtàn'],
    ig: ['Mụta', 'Mmegharị', 'Nwale', 'Akụkọ'],
    ha: ['Koya', 'Aiki', 'Gwada', 'Labari'],
  };
  const icons = ['📘', '✍️', '🧠', '📖'];
  const [learn, practice, quiz, story] = labels[languageCode];
  return [
    { icon: icons[0], label: learn, prompt: prompts[0] },
    { icon: icons[1], label: practice, prompt: prompts[1] },
    { icon: icons[2], label: quiz, prompt: prompts[2] },
    { icon: icons[3], label: story, prompt: prompts[3] },
  ];
};

export const getQuickPrompts = (
  subjectLabel: string,
  grade: number,
  languageCode: LanguageCode
): string[] => {
  const promptsByLanguage: Record<LanguageCode, string[]> = {
    en: [
      `Teach me about ${subjectLabel} for Primary ${grade}`,
      'Give me an exercise to practice',
      'Quiz me on what I learned',
      'Tell me a short story about this topic',
    ],
    yo: [
      `Kọ́ mi nípa ${subjectLabel} fún Primary ${grade}`,
      'Fun mi ní iṣẹ́ àdánwò kan',
      'Dán mi wò lórí ohun tí mo kọ́',
      'Sọ ìtàn kúkúrú nípa kókó yìí',
    ],
    ig: [
      `Kụziere m gbasara ${subjectLabel} maka Primary ${grade}`,
      'Nye m otu mmega ka m mee',
      'Nwale m n’ihe m mụtara',
      'Kọọrọ m obere akụkọ gbasara isiokwu a',
    ],
    ha: [
      `Ka koya mini game da ${subjectLabel} na Primary ${grade}`,
      'Ka bani atisaye guda ɗaya',
      'Yi mini gwaji kan abin da na koya',
      'Ka ba ni gajeren labari kan wannan darasi',
    ],
  };
  return promptsByLanguage[languageCode];
};

const SUBJECT_TOPIC_MAP: Record<string, string[]> = {
  'English Language': [
    'Reading & Comprehension',
    'Grammar & Punctuation',
    'Vocabulary',
    'Creative Writing',
    'Spelling',
  ],
  'English Studies': [
    'Reading & Comprehension',
    'Grammar & Punctuation',
    'Vocabulary',
    'Creative Writing',
    'Spelling',
  ],
  Mathematics: [
    'Numbers & Counting',
    'Addition & Subtraction',
    'Multiplication & Division',
    'Fractions',
    'Shapes & Geometry',
    'Word Problems',
  ],
  'Basic Science': [
    'Living Things',
    'Plants & Animals',
    'Human Body',
    'Weather & Environment',
    'Simple Machines',
    'Health & Hygiene',
  ],
  'Basic Science & Technology': [
    'Living Things',
    'Plants & Animals',
    'Human Body',
    'Weather & Environment',
    'Simple Machines',
    'Health & Hygiene',
  ],
  'Social Studies': [
    'My Family & Community',
    'Nigeria & Its People',
    'Our Government',
    'Map Reading',
    'Transportation',
    'Culture & Festivals',
  ],
  'Social & Citizenship Studies': [
    'My Family & Community',
    'Nigeria & Its People',
    'Our Government',
    'Map Reading',
    'Transportation',
    'Culture & Festivals',
  ],
  'Civic Education': [
    'Rights & Responsibilities',
    'Good Citizenship',
    'Our Constitution',
    'Community Service',
    'Democracy',
    'National Symbols',
  ],
  'Agricultural Science': [
    'Farming & Crops',
    'Soil & Fertilizer',
    'Farm Animals',
    'Food & Nutrition',
    'Farm Tools',
    'Pest Control',
  ],
};

const GENERIC_TOPICS = [
  'Introduction & Basics',
  'Key Concepts',
  'Practice & Examples',
  'Review & Quiz',
];

/** Lesson topic choices shown before chat starts for a subject. */
export function getTopicsForSubject(subjectLabel: string): string[] {
  if (SUBJECT_TOPIC_MAP[subjectLabel]) {
    return SUBJECT_TOPIC_MAP[subjectLabel];
  }
  const key = Object.keys(SUBJECT_TOPIC_MAP).find((k) =>
    subjectLabel.toLowerCase().includes(k.toLowerCase().split(' ')[0] ?? '')
  );
  if (key) return SUBJECT_TOPIC_MAP[key];
  return GENERIC_TOPICS;
}

export const ALL_SUBJECTS: Subject[] = [
  ...CORE_SUBJECTS,
  ...LANGUAGE_SUBJECTS,
  ...SOFT_SKILLS,
];

export function findSubjectByLabel(label: string): Subject | null {
  const normalized = label.trim().toLowerCase();
  return (
    ALL_SUBJECTS.find((s) => s.label.toLowerCase() === normalized) ??
    ALL_SUBJECTS.find((s) => normalized.includes(s.label.toLowerCase().split(' ')[0] ?? '')) ??
    null
  );
}
