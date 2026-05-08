import type { LanguageCode } from '@/constants/languages';

export interface Subject {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  category: 'core' | 'language' | 'softskill';
  description: string;
}

export const CORE_SUBJECTS: Subject[] = [
  { id: 'math', label: 'Mathematics', icon: '🔢', color: '#1a6b3c', bgColor: '#d1fae5', category: 'core', description: 'Numbers, shapes and more' },
  { id: 'english', label: 'English Language', icon: '📖', color: '#1d4ed8', bgColor: '#dbeafe', category: 'core', description: 'Reading, writing and grammar' },
  { id: 'science', label: 'Basic Science', icon: '🔬', color: '#7c3aed', bgColor: '#ede9fe', category: 'core', description: 'Explore the world around us' },
  { id: 'social', label: 'Social Studies', icon: '🌍', color: '#d97706', bgColor: '#fef3c7', category: 'core', description: 'Nigeria and our community' },
  { id: 'agric', label: 'Agriculture', icon: '🌱', color: '#166534', bgColor: '#dcfce7', category: 'core', description: 'Farming and food production' },
  { id: 'civic', label: 'Civic Education', icon: '🏛️', color: '#0f766e', bgColor: '#ccfbf1', category: 'core', description: 'Rights, duties and democracy' },
  { id: 'computer', label: 'Computer Studies', icon: '💻', color: '#0369a1', bgColor: '#e0f2fe', category: 'core', description: 'Tech and digital skills' },
  { id: 'home_econ', label: 'Home Economics', icon: '🏠', color: '#be185d', bgColor: '#fce7f3', category: 'core', description: 'Cooking, sewing and home care' },
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
    math: { label: 'Mátimatiki', description: 'Nọ́ńbà, àwòrán àti bẹ́ẹ̀ bẹ́ẹ̀ lọ' },
    english: { label: 'Èdè Gẹ̀ẹ́sì', description: 'Kíkà, kíkọ àti grama' },
    science: { label: 'Sáyẹ́nsì Alákọ̀bẹrẹ', description: 'Ṣàwárí ayé tó yí wa ká' },
    social: { label: 'Ẹ̀kọ́ Ìbáṣepọ̀ Àwùjọ', description: 'Naijiria àti àwùjọ wa' },
    agric: { label: 'Ẹ̀kọ́ Ọgbìn', description: 'Ọ̀gbìn àti oúnjẹ' },
    civic: { label: 'Ẹ̀kọ́ Ọmọ Orílẹ̀-èdè', description: 'Ẹ̀tọ́, ojúṣe àti ìjọba tiwántíwá' },
    computer: { label: 'Ẹ̀kọ́ Kọ̀m̀pútà', description: 'Ìmọ̀ ẹ̀rọ àti ọgbọ́n díjítàlì' },
    home_econ: { label: 'Ọgbà Ilé', description: 'Sísè oúnjẹ, hihun àti títọ́jú ilé' },
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
    math: { label: 'Mgbakọ na Mwepụ', description: 'Nọmba, udi na ihe ndị ọzọ' },
    english: { label: 'Asụsụ Bekee', description: 'Ịgụ, ide na grama' },
    science: { label: 'Sayensị Isi', description: 'Chọpụta ụwa gbara anyị gburugburu' },
    social: { label: 'Ihe Ọmụmụ Obodo', description: 'Naịjịrịa na obodo anyị' },
    agric: { label: 'Ọrụ Ugbo', description: 'Ugbo na mmepụta nri' },
    civic: { label: 'Mmụta Nwa Amaala', description: 'Ikike, ọrụ na ọchịchị' },
    computer: { label: 'Mmụta Kọmputa', description: 'Nkà teknụzụ na dijitalụ' },
    home_econ: { label: 'Nlekọta Ụlọ', description: 'Isi nri, akwa na nlekọta ụlọ' },
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
    math: { label: 'Lissafi', description: 'Lambobi, siffofi da sauransu' },
    english: { label: 'Turanci', description: 'Karatu, rubutu da nahawu' },
    science: { label: 'Kimiyya ta Farko', description: 'Binciki duniyar da ke kewaye da mu' },
    social: { label: 'Nazarin Zamantakewa', description: 'Najeriya da al’ummarmu' },
    agric: { label: 'Noma', description: 'Noma da samar da abinci' },
    civic: { label: 'Ilimin Ɗan Ƙasa', description: 'Haƙƙoƙi, nauyi da dimokuradiyya' },
    computer: { label: 'Nazarin Kwamfuta', description: 'Fasaha da ƙwarewar dijital' },
    home_econ: { label: 'Tattalin Gida', description: 'Dafa abinci, dinki da kula da gida' },
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