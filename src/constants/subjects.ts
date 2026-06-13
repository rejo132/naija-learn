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

/** Grade/subject/topic catalog — source of truth aligned with scripts/generate-lessons.js */
const SUBJECTS_BY_GRADE = {
  1: [
    { subject: 'English Studies', topics: [
      'Letter Sounds and Phonics',
      'Sight Words and Reading',
      'Nouns and Action Words',
      'Simple Sentences',
      'Tracing and Copying',
    ]},
    { subject: 'Mathematics', topics: [
      'Counting 1 to 100',
      'Addition',
      'Subtraction',
      'Shapes',
      'Telling Time',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Living and Non-Living Things',
      'Parts of the Human Body',
      'Plants and Animals',
      'Water and Its Uses',
      'Simple Tools',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Running and Jumping',
      'Hand Washing',
      'Playground Safety',
      'Healthy Foods',
      'Cleaning Teeth',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'Creation Story',
      'Early Prophets',
      'Prayer and Worship',
      'Kindness and Respect',
      'Honesty',
    ]},
    { subject: 'Nigerian History', topics: [
      'My Family and Community',
      'Nigerian Flag and Anthem',
      'Famous Nigerians',
      'Our Local Heroes',
      'Independence Day',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'My Family',
      'Community Helpers',
      'Road Safety',
      'Our Culture',
      'Being a Good Citizen',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Primary Colors',
      'Drawing and Colouring',
      'Simple Paper Crafts',
      'Nigerian Songs',
      'Drama and Roleplay',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'What is a Computer',
      'Parts of a Computer',
      'Using a Mouse',
      'Typing Basics',
      'Staying Safe Online',
    ]},
    { subject: 'Confidence Building', topics: [
      'Believing in Yourself',
      'Speaking Up',
      'Trying New Things',
      'Learning from Mistakes',
      'Celebrating Success',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Hand Washing',
      'Brushing Teeth',
      'Bathing',
      'Clean Clothes',
      'Clean Environment',
    ]},
    { subject: 'Communication', topics: [
      'Listening Skills',
      'Speaking Clearly',
      'Polite Words',
      'Body Language',
      'Sharing Ideas',
    ]},
    { subject: 'Leadership', topics: [
      'Being a Good Example',
      'Helping Others',
      'Taking Turns',
      'Responsibility',
      'School Helpers',
    ]},
    { subject: 'Teamwork', topics: [
      'Playing Together',
      'Sharing Tasks',
      'Supporting Friends',
      'Winning Together',
      'Resolving Disputes',
    ]},
    { subject: 'Creativity', topics: [
      'Drawing Ideas',
      'Making Stories',
      'Building with Blocks',
      'Music and Rhythm',
      'Imaginative Play',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Greetings in Yoruba',
      'Numbers in Yoruba',
      'Family Words',
      'Colours in Yoruba',
      'Simple Phrases',
    ]},
    { subject: 'Igbo Language', topics: [
      'Greetings in Igbo',
      'Numbers in Igbo',
      'Family Words',
      'Colours in Igbo',
      'Simple Phrases',
    ]},
    { subject: 'Hausa Language', topics: [
      'Greetings in Hausa',
      'Numbers in Hausa',
      'Family Words',
      'Colours in Hausa',
      'Simple Phrases',
    ]},
  ],
  2: [
    { subject: 'English Studies', topics: [
      'Vowels and Consonants',
      'Reading Short Stories',
      'Nouns and Verbs',
      'Simple Sentences',
      'Spelling Common Words',
    ]},
    { subject: 'Mathematics', topics: [
      'Counting 1 to 500',
      'Multiplication Intro',
      'Division Intro',
      'Fractions Half and Quarter',
      'Money and Prices',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'The Human Senses',
      'Weather and Seasons',
      'Soil and Its Uses',
      'Air and Wind',
      'Simple Machines',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Running and Relay',
      'Jumping and Skipping',
      'Nutrition Basics',
      'Personal Hygiene',
      'Team Games',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'Life of Abraham',
      'Five Pillars of Islam',
      'Honesty and Forgiveness',
      'Love and Service',
      'Worship and Prayer',
    ]},
    { subject: 'Nigerian History', topics: [
      'Nigerian States',
      'Pre-Colonial Nigeria',
      'Trade Routes',
      'Cultural Heritage',
      'Famous Leaders',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Types of Families',
      'Our Government',
      'Transportation',
      'Nigerian Culture',
      'Festivals and Celebrations',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Nigerian Music',
      'Folk Tales',
      'Drama and Acting',
      'Weaving and Crafts',
      'Pottery',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'Keyboard Skills',
      'Drawing on Computer',
      'Internet Basics',
      'Password Safety',
      'Educational Games',
    ]},
    { subject: 'Confidence Building', topics: [
      'Setting Small Goals',
      'Facing Fears',
      'Positive Self Talk',
      'Asking for Help',
      'Praising Effort',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Personal Grooming',
      'Nail Care',
      'Hair Care',
      'Healthy Habits',
      'School Cleanliness',
    ]},
    { subject: 'Communication', topics: [
      'Asking Questions',
      'Telling Stories',
      'Expressing Feelings',
      'Polite Words',
      'Group Discussions',
    ]},
    { subject: 'Leadership', topics: [
      'Class Monitor Duties',
      'Encouraging Friends',
      'Fairness',
      'Following Rules',
      'Leading Activities',
    ]},
    { subject: 'Teamwork', topics: [
      'Group Projects',
      'Supporting Teammates',
      'Sharing Ideas',
      'Cooperating in Games',
      'Celebrating Together',
    ]},
    { subject: 'Creativity', topics: [
      'Craft Making',
      'Storytelling',
      'Drawing Patterns',
      'Singing and Dancing',
      'Inventing Games',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Days of the Week',
      'Food Words',
      'Animals in Yoruba',
      'Body Parts',
      'Short Sentences',
    ]},
    { subject: 'Igbo Language', topics: [
      'Days of the Week',
      'Food Words',
      'Animals in Igbo',
      'Body Parts',
      'Short Sentences',
    ]},
    { subject: 'Hausa Language', topics: [
      'Days of the Week',
      'Food Words',
      'Animals in Hausa',
      'Body Parts',
      'Short Sentences',
    ]},
  ],
  3: [
    { subject: 'English Studies', topics: [
      'Phoneme Identification',
      'Comprehension Passages',
      'Parts of Speech',
      'Punctuation',
      'Letter Writing',
    ]},
    { subject: 'Mathematics', topics: [
      'Multiplication Tables',
      'Long Division',
      'Fractions',
      'Decimals',
      'Geometry Basics',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Food Chains',
      'Ecosystems',
      'Rocks and Soil',
      'Forces and Motion',
      'Simple Machines',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Athletics',
      'Team Sports',
      'First Aid Basics',
      'Disease Prevention',
      'Growth and Development',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'The Ten Commandments',
      'Wudhu and Cleanliness',
      'Prophets and Heroes',
      'Charity and Giving',
      'Fasting and Sacrifice',
    ]},
    { subject: 'Nigerian History', topics: [
      'Nigerian Kingdoms',
      'Colonial History',
      'Road to Independence',
      'National Heroes',
      'Post Colonial Nigeria',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Nigerian Geography',
      'Agriculture in Nigeria',
      'Trade and Markets',
      'Transport Systems',
      'National Symbols',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Nigerian Art',
      'Sculpture and Crafts',
      'Batik and Tie Dye',
      'Music Instruments',
      'Performing Arts',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'File Management',
      'Word Processing Basics',
      'Safe Internet Use',
      'Digital Communication',
      'Introduction to Coding',
    ]},
    { subject: 'Confidence Building', topics: [
      'Public Speaking',
      'Self Awareness',
      'Overcoming Stage Fright',
      'Goal Setting',
      'Positive Mindset',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Dental Hygiene',
      'Skin Care',
      'Waste Management',
      'Study Space Cleanliness',
      'Disease Prevention',
    ]},
    { subject: 'Communication', topics: [
      'Active Listening',
      'Clear Speaking',
      'Non Verbal Communication',
      'Giving Feedback',
      'Conflict Resolution',
    ]},
    { subject: 'Leadership', topics: [
      'Delegating Tasks',
      'Managing Resources',
      'Conflict Mediation',
      'Accountability',
      'Inspiring Others',
    ]},
    { subject: 'Teamwork', topics: [
      'Group Research',
      'Defining Roles',
      'Supporting Peers',
      'Brainstorming',
      'Collaborative Success',
    ]},
    { subject: 'Creativity', topics: [
      'Alternative Solutions',
      'Breaking Down Problems',
      'Designing Prototypes',
      'Innovative Drawing',
      'Creative Writing',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Yoruba Alphabet',
      'Simple Conversations',
      'Describing People',
      'Yoruba Proverbs',
      'Reading Short Texts',
    ]},
    { subject: 'Igbo Language', topics: [
      'Igbo Alphabet',
      'Simple Conversations',
      'Describing People',
      'Igbo Proverbs',
      'Reading Short Texts',
    ]},
    { subject: 'Hausa Language', topics: [
      'Hausa Alphabet',
      'Simple Conversations',
      'Describing People',
      'Hausa Proverbs',
      'Reading Short Texts',
    ]},
  ],
  4: [
    { subject: 'English Studies', topics: [
      'Word Stress and Intonation',
      'Eight Parts of Speech',
      'Subject Verb Agreement',
      'Narrative Essay Writing',
      'Formal and Informal Letters',
    ]},
    { subject: 'Mathematics', topics: [
      'LCM and HCF',
      'Percentages',
      'Ratios',
      'Area and Perimeter',
      'Data and Graphs',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Human Skeletal System',
      'Digestive System',
      'Forms of Energy',
      'Simple Electrical Circuits',
      'Engineering Materials',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Track and Field',
      'Ball Games Rules',
      'Puberty and Body Changes',
      'Reproductive Health',
      'Drug Awareness',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'Life of Jesus Christ',
      'Life of Prophet Muhammad',
      'Ethics and Justice',
      'Tolerance and Peace',
      'Community Service',
    ]},
    { subject: 'Nigerian History', topics: [
      'Oyo Empire',
      'Benin Kingdom',
      'Sokoto Caliphate',
      'Amalgamation of 1914',
      'Nigerian Independence 1960',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Structure of Government',
      'Rights and Duties',
      'Leadership and Accountability',
      'National Symbols',
      'Drug and Substance Abuse',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Secondary Color Mixing',
      'Traditional Motifs',
      'Tie and Dye',
      'Printmaking',
      'Graphic Design Intro',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'Desktop Operations',
      'Web Safety',
      'Constructing Emails',
      'Scratch Coding Basics',
      'Introduction to AI',
    ]},
    { subject: 'Confidence Building', topics: [
      'Vocal Projection',
      'Eye Contact',
      'Strengths Identification',
      'Emotion Management',
      'Presenting Ideas',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Comprehensive Dental Care',
      'Nail Grooming',
      'Skin Protection',
      'Domestic Waste Management',
      'Eliminating Disease Vectors',
    ]},
    { subject: 'Communication', topics: [
      'Reflective Listening',
      'Facial Expressions',
      'Professional Posture',
      'Spatial Boundaries',
      'Polite Responses',
    ]},
    { subject: 'Leadership', topics: [
      'Peer Assignment Delegation',
      'Setting Deadlines',
      'Managing Shared Resources',
      'Mediating Disagreements',
      'Win Win Outcomes',
    ]},
    { subject: 'Teamwork', topics: [
      'Group Research Methods',
      'Specialized Roles',
      'Supporting Struggling Peers',
      'Brainstorming Sessions',
      'Validating Team Success',
    ]},
    { subject: 'Creativity', topics: [
      'Designing Solutions',
      'Breaking Complex Tasks',
      'Overcoming Blockages',
      'Prototypes from Local Waste',
      'Transforming Errors',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Yoruba Grammar',
      'Reading Passages',
      'Writing in Yoruba',
      'Yoruba Literature',
      'Oral Presentations',
    ]},
    { subject: 'Igbo Language', topics: [
      'Igbo Grammar',
      'Reading Passages',
      'Writing in Igbo',
      'Igbo Literature',
      'Oral Presentations',
    ]},
    { subject: 'Hausa Language', topics: [
      'Hausa Grammar',
      'Reading Passages',
      'Writing in Hausa',
      'Hausa Literature',
      'Oral Presentations',
    ]},
  ],
  5: [
    { subject: 'English Studies', topics: [
      'Debate and Public Speaking',
      'Critical Reading',
      'Figures of Speech',
      'Summary Writing',
      'Argumentative Essays',
    ]},
    { subject: 'Mathematics', topics: [
      'Linear Equations',
      'Geometry Angles',
      'Profit and Loss',
      'Simple Interest',
      'Statistics and Charts',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Cells and Organisms',
      'Chemical Changes',
      'Solar System',
      'Technology and Innovation',
      'Environmental Science',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Advanced Athletics',
      'HIV and AIDS Awareness',
      'Substance Abuse',
      'Mental Health',
      'Sports Injuries',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'World Religions Overview',
      'Peace and Dialogue',
      'Morality in Society',
      'Spirituality and Faith',
      'Religious Conflicts',
    ]},
    { subject: 'Nigerian History', topics: [
      'ECOWAS and West Africa',
      'Nigerian Civil War',
      'Post Independence Leaders',
      'Democracy in Nigeria',
      'Nigeria and the World',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Electoral Process',
      'Rule of Law',
      'Corruption and Effects',
      'National Values',
      'Global Citizenship',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Art History',
      'World Music',
      'Film Making Basics',
      'Nollywood',
      'Afrobeats and Culture',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'Advanced Web Safety',
      'Digital Footprint',
      'Big Data Concepts',
      'AI and Society',
      'Coding Logic',
    ]},
    { subject: 'Confidence Building', topics: [
      'Advanced Public Speaking',
      'Personal Branding',
      'Handling Criticism',
      'Resilience Building',
      'Inspiring Others',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Advanced Personal Care',
      'Environmental Health',
      'Community Sanitation',
      'Disease Outbreak Prevention',
      'Mental Wellness and Hygiene',
    ]},
    { subject: 'Communication', topics: [
      'Advanced Listening',
      'Persuasive Communication',
      'Digital Communication',
      'Cross Cultural Communication',
      'Conflict De-escalation',
    ]},
    { subject: 'Leadership', topics: [
      'Strategic Planning',
      'Community Leadership',
      'Ethics in Leadership',
      'Motivating Others',
      'Leadership Styles',
    ]},
    { subject: 'Teamwork', topics: [
      'Complex Group Projects',
      'Role Specialization',
      'Peer Mentoring',
      'Celebrating Diversity',
      'Team Conflict Resolution',
    ]},
    { subject: 'Creativity', topics: [
      'Innovation Thinking',
      'Design Thinking Process',
      'Creative Entrepreneurship',
      'Art from Recycled Materials',
      'Presenting Creative Work',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Advanced Yoruba Grammar',
      'Yoruba Poetry',
      'Cultural Expressions',
      'Yoruba History through Language',
      'Debates in Yoruba',
    ]},
    { subject: 'Igbo Language', topics: [
      'Advanced Igbo Grammar',
      'Igbo Poetry',
      'Cultural Expressions',
      'Igbo History through Language',
      'Debates in Igbo',
    ]},
    { subject: 'Hausa Language', topics: [
      'Advanced Hausa Grammar',
      'Hausa Poetry',
      'Cultural Expressions',
      'Hausa History through Language',
      'Debates in Hausa',
    ]},
  ],
  6: [
    { subject: 'English Studies', topics: [
      'Advanced Essay Writing',
      'Poetry Analysis',
      'Drama and Literature',
      'Public Speaking',
      'Critical Thinking and Reading',
    ]},
    { subject: 'Mathematics', topics: [
      'Quadratic Equations',
      'Trigonometry Intro',
      'Probability',
      'Financial Mathematics',
      'Advanced Statistics',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Genetics Basics',
      'Climate Change',
      'Nuclear Energy Intro',
      'Biotechnology',
      'Future Technologies',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Advanced First Aid',
      'Nutrition Science',
      'Mental Wellness',
      'Sports Leadership',
      'Lifelong Fitness',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'Comparative Religion',
      'Faith and Science',
      'Social Justice',
      'End of Life and Afterlife',
      'Religious Leadership',
    ]},
    { subject: 'Nigerian History', topics: [
      'United Nations and Nigeria',
      'Globalisation',
      'Human Rights in Nigeria',
      'Sustainable Development',
      'Nigerias Future',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Constitutional Rights',
      'Civic Responsibility',
      'Anti Corruption',
      'Peace Building',
      'Diplomacy and Foreign Policy',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Contemporary Nigerian Art',
      'Digital Art',
      'Music Production',
      'Nigerian Cinema',
      'Creative Writing and Publishing',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'Advanced Coding',
      'Cybersecurity Basics',
      'Artificial Intelligence Ethics',
      'Digital Entrepreneurship',
      'Building Simple Apps',
    ]},
    { subject: 'Confidence Building', topics: [
      'Leadership Presence',
      'Advanced Self Awareness',
      'Life Vision Setting',
      'Overcoming Major Challenges',
      'Legacy and Impact',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Holistic Health',
      'Community Health Leadership',
      'Environmental Sustainability',
      'Advanced Disease Prevention',
      'Health Advocacy',
    ]},
    { subject: 'Communication', topics: [
      'Professional Communication',
      'Public Relations Basics',
      'Media Literacy',
      'Negotiation Skills',
      'Advanced Presentations',
    ]},
    { subject: 'Leadership', topics: [
      'Visionary Leadership',
      'Social Entrepreneurship',
      'National Development',
      'Mentoring Others',
      'Leading Change',
    ]},
    { subject: 'Teamwork', topics: [
      'Leading Complex Teams',
      'Inter School Collaboration',
      'Community Impact Projects',
      'Global Teamwork',
      'Legacy Projects',
    ]},
    { subject: 'Creativity', topics: [
      'Advanced Design Thinking',
      'Social Innovation',
      'Creative Leadership',
      'Building a Portfolio',
      'Pitching Creative Ideas',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Yoruba Literature Analysis',
      'Advanced Writing',
      'Oral Tradition',
      'Yoruba in Modern World',
      'Final Presentations',
    ]},
    { subject: 'Igbo Language', topics: [
      'Igbo Literature Analysis',
      'Advanced Writing',
      'Oral Tradition',
      'Igbo in Modern World',
      'Final Presentations',
    ]},
    { subject: 'Hausa Language', topics: [
      'Hausa Literature Analysis',
      'Advanced Writing',
      'Oral Tradition',
      'Hausa in Modern World',
      'Final Presentations',
    ]},
  ],
};

/** Lesson topics for a subject at a given primary grade (1–6). */
export function getTopicsForSubject(subjectLabel: string, grade: number): string[] {
  const gradeSubjects = SUBJECTS_BY_GRADE[grade as keyof typeof SUBJECTS_BY_GRADE];
  if (!gradeSubjects) return [];
  const entry = gradeSubjects.find((s) => s.subject === subjectLabel);
  return entry?.topics ?? [];
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
