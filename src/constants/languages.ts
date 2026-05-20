/**
 * App languages, UI copy, and AI language instructions.
 */
export type Language = 'en' | 'ha' | 'yo' | 'ig';

export type LanguageCode = Language;

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: '🇬🇧 English',
  ha: '🌙 Hausa',
  yo: '🥁 Yoruba',
  ig: '🦅 Igbo',
};

export const UI_TEXT: Record<Language, {
  home: string;
  learn: string;
  progress: string;
  achievements: string;
  myTutor: string;
  children: string;
  reports: string;
  signOut: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  welcomeBack: string;
  askAI: string;
  aiPickForYou: string;
  startLesson: string;
  dailyMission: string;
  subjects: string;
  languages: string;
  softSkills: string;
  askAnything: string;
  startQuiz: string;
  welcomeBackAuth: string;
  signInToContinue: string;
  emailAddress: string;
  password: string;
  keepSignedIn: string;
  forgotPassword: string;
  signIn: string;
  noAccount: string;
  signUpFree: string;
  orSignInWith: string;
  myProgress: string;
  streak: string;
  totalXP: string;
  loading: string;
  error: string;
  retry: string;
  save: string;
  cancel: string;
  confirm: string;
  back: string;
  next: string;
  done: string;
  start: string;
  correct: string;
  incorrect: string;
  score: string;
  level: string;
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  forgotPasswordButton: string;
  forgotPasswordSuccess: string;
  forgotPasswordBack: string;
  changePinTitle: string;
  changePinCurrent: string;
  changePinNew: string;
  changePinConfirm: string;
  changePinButton: string;
  changePinSuccess: string;
  changePinSuccessMsg: string;
  childrenTitle: string;
  childrenAdd: string;
  childrenEmpty: string;
  childrenEmptySubtitle: string;
  childrenName: string;
  childrenGrade: string;
  childrenSave: string;
  childrenDelete: string;
  childrenEdit: string;
  childSelectTitle: string;
  childSelectSubtitle: string;
  childSelectAdd: string;
  childSelectContinue: string;
  parentDashTitle: string;
  parentDashProgress: string;
  parentDashSessions: string;
  parentDashNoData: string;
  parentDashSubject: string;
  parentDashScore: string;
  parentDashDate: string;
  personalityTitle: string;
  personalitySubtitle: string;
  personalitySelect: string;
  personalitySelected: string;
  progressTitle: string;
  progressXP: string;
  progressStreak: string;
  progressLessons: string;
  progressBestScore: string;
  progressAchievements: string;
  achievementsTitle: string;
  achievementsLocked: string;
  achievementsUnlocked: string;
  achievementsProgress: string;
  settingsTitle: string;
  settingsParentZone: string;
  settingsForChild: string;
  settingsAppPrefs: string;
  settingsAbout: string;
  settingsSignOut: string;
  settingsDarkMode: string;
  settingsLanguage: string;
  settingsGrade: string;
  settingsChangePIN: string;
  settingsManageChildren: string;
  parentGateTitle: string;
  parentGateSubtitle: string;
  parentGateSetupTitle: string;
  parentGateSetupSubtitle: string;
  parentGateSetPIN: string;
  parentGateEnter: string;
  parentGateWrong: string;
  parentGateHint: string;
  childSwitcherTitle: string;
  childSwitcherActive: string;
  offlineBanner: string;
  offlineBannerSub: string;
  offlineTitle: string;
  offlineQuiz: string;
  offlineFlashcards: string;
  offlineBack: string;
  progressShort: string;
  achievementsShort: string;
  settingsShort: string;
  childrenShort: string;
}> = {
  en: {
    home: 'Home',
    learn: 'Learn',
    progress: 'My Progress',
    achievements: 'Achievements',
    myTutor: 'My Tutor',
    children: 'Children',
    reports: 'Reports',
    signOut: 'Sign Out',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    welcomeBack: 'Welcome back',
    askAI: 'Ask AI — what do you want to learn today?',
    aiPickForYou: 'AI PICK FOR YOU',
    startLesson: 'Start →',
    dailyMission: 'Daily Mission',
    subjects: 'Subjects',
    languages: 'Languages',
    softSkills: 'Soft Skills',
    askAnything: 'Ask anything...',
    startQuiz: 'Start Quiz',
    welcomeBackAuth: 'Welcome back 🎉',
    signInToContinue: 'Sign in to continue learning',
    emailAddress: 'Email address',
    password: 'Password',
    keepSignedIn: 'Keep me signed in',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In →',
    noAccount: 'No account?',
    signUpFree: 'Sign up free',
    orSignInWith: 'or sign in with',
    myProgress: 'My Progress',
    streak: 'Day Streak',
    totalXP: 'Total XP',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    start: 'Start',
    correct: 'Correct! ✓',
    incorrect: 'Not quite. Try again!',
    score: 'Score',
    level: 'Level',
    forgotPasswordTitle: 'Forgot Password',
    forgotPasswordSubtitle: 'Enter your email and we will send you a reset link',
    forgotPasswordButton: 'Send Reset Link',
    forgotPasswordSuccess: 'Check your email for the reset link',
    forgotPasswordBack: 'Back to Sign In',
    changePinTitle: 'Change Parent PIN',
    changePinCurrent: 'Current PIN',
    changePinNew: 'New PIN',
    changePinConfirm: 'Confirm New PIN',
    changePinButton: 'Update PIN',
    changePinSuccess: 'PIN Updated!',
    changePinSuccessMsg: 'Your Parent Portal PIN has been changed successfully.',
    childrenTitle: 'Manage Children',
    childrenAdd: 'Add Child',
    childrenEmpty: 'No children added yet',
    childrenEmptySubtitle: 'Add your first child to get started',
    childrenName: "Child's Name",
    childrenGrade: 'Grade',
    childrenSave: 'Save',
    childrenDelete: 'Delete',
    childrenEdit: 'Edit',
    childSelectTitle: 'Who is studying today?',
    childSelectSubtitle: 'Choose a profile to continue',
    childSelectAdd: 'Add Another Child',
    childSelectContinue: 'Continue',
    parentDashTitle: 'Parent Dashboard',
    parentDashProgress: 'Progress',
    parentDashSessions: 'Recent Sessions',
    parentDashNoData: 'No sessions yet',
    parentDashSubject: 'Subject',
    parentDashScore: 'Score',
    parentDashDate: 'Date',
    personalityTitle: 'Choose Your Tutor',
    personalitySubtitle: 'Pick the tutor that feels right for you',
    personalitySelect: 'Select',
    personalitySelected: 'Selected',
    progressTitle: 'My Progress',
    progressXP: 'Total XP',
    progressStreak: 'Day Streak',
    progressLessons: 'Lessons Done',
    progressBestScore: 'Best Score',
    progressAchievements: 'Achievements',
    achievementsTitle: 'Achievements',
    achievementsLocked: 'Locked',
    achievementsUnlocked: 'Unlocked',
    achievementsProgress: 'Keep going to unlock more!',
    settingsTitle: 'Settings',
    settingsParentZone: 'Parent Zone',
    settingsForChild: 'For Child',
    settingsAppPrefs: 'App Preferences',
    settingsAbout: 'About & Support',
    settingsSignOut: 'Sign Out',
    settingsDarkMode: 'Dark Mode',
    settingsLanguage: 'Language',
    settingsGrade: 'Grade',
    settingsChangePIN: 'Change Parent PIN',
    settingsManageChildren: 'Manage Children',
    parentGateTitle: 'Parent Zone',
    parentGateSubtitle: 'Enter your PIN to continue',
    parentGateSetupTitle: 'Create Your Parent PIN',
    parentGateSetupSubtitle: 'Set a 4-digit PIN to protect the Parent Zone',
    parentGateSetPIN: 'Set PIN',
    parentGateEnter: 'Enter PIN',
    parentGateWrong: 'Incorrect PIN. Try again.',
    parentGateHint: 'Change your PIN in Settings',
    childSwitcherTitle: 'Switch Child',
    childSwitcherActive: 'Active',
    offlineBanner: 'You are offline',
    offlineBannerSub: 'Using saved content',
    offlineTitle: 'Offline Mode',
    offlineQuiz: 'Practice Quiz',
    offlineFlashcards: 'Flashcards',
    offlineBack: 'Back',
    progressShort: 'Stats',
    achievementsShort: 'Awards',
    settingsShort: 'More',
    childrenShort: 'Kids',
  },
  ha: {
    home: 'Gida',
    learn: 'Koyo',
    progress: 'Ci Gabana',
    achievements: 'Nasarori',
    myTutor: 'Malomina',
    children: 'Yara',
    reports: 'Rahoto',
    signOut: 'Fita',
    goodMorning: 'Ina kwana',
    goodAfternoon: 'Barka da rana',
    goodEvening: 'Barka da yamma',
    welcomeBack: 'Maraba da dawowa',
    askAI: 'Tambaya AI — me kake son koyo yau?',
    aiPickForYou: 'ZABIN AI GARE KA',
    startLesson: 'Fara →',
    dailyMission: 'Aikin Yau',
    subjects: 'Darussan',
    languages: 'Harsunan',
    softSkills: 'Ƙwarewar Rayuwa',
    askAnything: 'Tambaya komai...',
    startQuiz: 'Fara Jarrabawa',
    welcomeBackAuth: 'Maraba da dawowa 🎉',
    signInToContinue: 'Shiga don ci gaba da koyo',
    emailAddress: 'Adireshin imel',
    password: 'Kalmar sirri',
    keepSignedIn: 'Ajiye shigarwa',
    forgotPassword: 'Manta kalmar sirri?',
    signIn: 'Shiga →',
    noAccount: 'Ba ka da asusun?',
    signUpFree: 'Yi rajista kyauta',
    orSignInWith: 'ko shiga da',
    myProgress: 'Ci Gabana',
    streak: 'Kwanaki a jere',
    totalXP: 'Jimillar XP',
    loading: 'Ana lodi...',
    error: 'Wani abu ya faru',
    retry: 'Sake gwadawa',
    save: 'Ajiye',
    cancel: 'Soke',
    confirm: 'Tabbatar',
    back: 'Koma baya',
    next: 'Gaba',
    done: 'An gama',
    start: 'Fara',
    correct: 'Daidai! ✓',
    incorrect: 'Ba daidai ba. Sake gwadawa!',
    score: 'Maki',
    level: 'Matakin',
    forgotPasswordTitle: 'Manta Kalmar Sirri',
    forgotPasswordSubtitle: 'Shigar da imel ɗinka mu aika maka hanyar sake saiti',
    forgotPasswordButton: 'Aika Hanyar Sake Saiti',
    forgotPasswordSuccess: 'Duba imel ɗinka don hanyar sake saiti',
    forgotPasswordBack: 'Komawa Shiga',
    changePinTitle: 'Canja PIN na Iyaye',
    changePinCurrent: 'PIN na Yanzu',
    changePinNew: 'Sabon PIN',
    changePinConfirm: 'Tabbatar da Sabon PIN',
    changePinButton: 'Sabunta PIN',
    changePinSuccess: 'An Sabunta PIN!',
    changePinSuccessMsg: 'An canja PIN ɗin Parent Portal cikin nasara.',
    childrenTitle: 'Sarrafa Yara',
    childrenAdd: 'Ƙara Yaro',
    childrenEmpty: 'Babu yara da aka ƙara',
    childrenEmptySubtitle: 'Ƙara ɗan ku na farko don farawa',
    childrenName: 'Sunan Yaro',
    childrenGrade: 'Aji',
    childrenSave: 'Ajiye',
    childrenDelete: 'Cire',
    childrenEdit: 'Gyara',
    childSelectTitle: 'Wane ne yana karatu yau?',
    childSelectSubtitle: 'Zaɓi bayanan martaba don ci gaba',
    childSelectAdd: 'Ƙara Wani Yaro',
    childSelectContinue: 'Ci gaba',
    parentDashTitle: 'Dashboard na Iyaye',
    parentDashProgress: 'Ci gaba',
    parentDashSessions: 'Zaman Kwanan Nan',
    parentDashNoData: 'Babu zaman tukuna',
    parentDashSubject: 'Darasi',
    parentDashScore: 'Maki',
    parentDashDate: 'Kwanan wata',
    personalityTitle: 'Zaɓi Malamin Ku',
    personalitySubtitle: 'Zaɓi malamin da ya dace da ku',
    personalitySelect: 'Zaɓi',
    personalitySelected: 'An zaɓa',
    progressTitle: 'Ci Gabana',
    progressXP: 'Jimillar XP',
    progressStreak: 'Jerin Kwanaki',
    progressLessons: 'Darussan da aka Kammala',
    progressBestScore: 'Mafi Kyawun Maki',
    progressAchievements: 'Nasarori',
    achievementsTitle: 'Nasarori',
    achievementsLocked: 'A kulle',
    achievementsUnlocked: 'An buɗe',
    achievementsProgress: 'Ci gaba don buɗe ƙarin!',
    settingsTitle: 'Saituna',
    settingsParentZone: 'Yankin Iyaye',
    settingsForChild: 'Ga Yaro',
    settingsAppPrefs: 'Abubuwan Manhaja',
    settingsAbout: 'Game da Mu & Taimako',
    settingsSignOut: 'Fita',
    settingsDarkMode: 'Yanayin Duhu',
    settingsLanguage: 'Harshe',
    settingsGrade: 'Aji',
    settingsChangePIN: 'Canja PIN na Iyaye',
    settingsManageChildren: 'Sarrafa Yara',
    parentGateTitle: 'Yankin Iyaye',
    parentGateSubtitle: 'Shigar da PIN ɗinka don ci gaba',
    parentGateSetupTitle: 'Ƙirƙiri PIN na Iyaye',
    parentGateSetupSubtitle: 'Saita PIN mai lamba 4 don kare Yankin Iyaye',
    parentGateSetPIN: 'Saita PIN',
    parentGateEnter: 'Shigar da PIN',
    parentGateWrong: 'PIN ba daidai ba. Sake gwadawa.',
    parentGateHint: 'Canja PIN ɗinka a Saituna',
    childSwitcherTitle: 'Canja Yaro',
    childSwitcherActive: 'Aiki',
    offlineBanner: 'Kana offline',
    offlineBannerSub: 'Ana amfani da abubuwan da aka ajiye',
    offlineTitle: 'Yanayin Offline',
    offlineQuiz: 'Gwajin Aiki',
    offlineFlashcards: 'Katunan Tunawa',
    offlineBack: 'Koma baya',
    progressShort: 'Kididdiga',
    achievementsShort: 'Kyauta',
    settingsShort: 'Ƙari',
    childrenShort: 'Yara',
  },
  yo: {
    home: 'Ilé',
    learn: 'Kọ́',
    progress: 'Ìlọsíwájú Mi',
    achievements: 'Àṣeyọrí',
    myTutor: 'Olùkọ́ Mi',
    children: 'Àwọn Ọmọ',
    reports: 'Ìjábọ̀',
    signOut: 'Jáde',
    goodMorning: 'Ẹ káàárọ̀',
    goodAfternoon: 'Ẹ káàsán',
    goodEvening: 'Ẹ káalẹ́',
    welcomeBack: 'Ẹ padà wà',
    askAI: 'Béèrè lọ́wọ́ AI — kí ni o fẹ́ kọ́ lónìí?',
    aiPickForYou: 'YÍYAN AI FÚN Ọ',
    startLesson: 'Bẹ̀rẹ̀ →',
    dailyMission: 'Iṣẹ́ Òjọ́',
    subjects: 'Àwọn Kókó',
    languages: 'Àwọn Èdè',
    softSkills: 'Ìmọ̀ Ìgbésí-ayé',
    askAnything: 'Béèrè ohunkóhun...',
    startQuiz: 'Bẹ̀rẹ̀ Ìdánwò',
    welcomeBackAuth: 'Ẹ padà wà 🎉',
    signInToContinue: 'Wọlé láti tẹ̀síwájú kíkọ́',
    emailAddress: 'Àdírẹ́sì ìméèlì',
    password: 'Ọ̀rọ̀ aṣínà',
    keepSignedIn: 'Jẹ́ kí n wà nínú',
    forgotPassword: 'Ó gbàgbé ọ̀rọ̀ aṣínà?',
    signIn: 'Wọlé →',
    noAccount: 'Kò sí àkọọ́lẹ̀?',
    signUpFree: 'Forúkọsilẹ̀ lọ́fẹ̀ẹ́',
    orSignInWith: 'tàbí wọlé pẹ̀lú',
    myProgress: 'Ìlọsíwájú Mi',
    streak: 'Ọjọ́ Tẹ̀síwájú',
    totalXP: 'Àpapọ̀ XP',
    loading: 'Ń gbàròó...',
    error: 'Nǹkan kan ṣẹlẹ̀',
    retry: 'Gbìyànjú Lẹ́ẹ̀kan Síi',
    save: 'Pamọ́',
    cancel: 'Fagilé',
    confirm: 'Jẹ́rìí',
    back: 'Padà',
    next: 'Tẹ̀síwájú',
    done: 'Parí',
    start: 'Bẹ̀rẹ̀',
    correct: 'Ó tọ̀! ✓',
    incorrect: 'Kò tọ̀. Gbìyànjú lẹ́ẹ̀kan síi!',
    score: 'Àmì',
    level: 'Ìpele',
    forgotPasswordTitle: 'Gbàgbé Ọ̀rọ̀ Aṣínà',
    forgotPasswordSubtitle: 'Tẹ imeeli rẹ a o fi ọ̀nà ìtúnṣe ránṣẹ́',
    forgotPasswordButton: 'Fi Ọ̀nà Ìtúnṣe Ránṣẹ́',
    forgotPasswordSuccess: 'Ṣàyẹ̀wò imeeli rẹ fún ọ̀nà ìtúnṣe',
    forgotPasswordBack: 'Padà sí Wíwọlé',
    changePinTitle: 'Yí Ọ̀rọ̀ Aṣínà Obi Padà',
    changePinCurrent: 'Ọ̀rọ̀ Aṣínà Lọ́wọ́lọ́wọ́',
    changePinNew: 'Ọ̀rọ̀ Aṣínà Tuntun',
    changePinConfirm: 'Jẹ́ Ìmúdájú Ọ̀rọ̀ Aṣínà Tuntun',
    changePinButton: 'Ṣe Ìmúdájú PIN',
    changePinSuccess: 'A Ṣe Ìmúdájú PIN!',
    changePinSuccessMsg: 'A ti yí ọ̀rọ̀ aṣínà Parent Portal padà ní àṣeyọrí.',
    childrenTitle: 'Ṣàkóso Àwọn Ọmọ',
    childrenAdd: 'Fi Ọmọ Kún',
    childrenEmpty: 'Kò sí ọmọ tí a fi kún sílẹ̀',
    childrenEmptySubtitle: 'Fi ọmọ akọ́kọ rẹ kún láti bẹ̀rẹ̀',
    childrenName: 'Orúkọ Ọmọ',
    childrenGrade: 'Kíláàsì',
    childrenSave: 'Pamọ́',
    childrenDelete: 'Paárẹ́',
    childrenEdit: 'Ṣàtúnṣe',
    childSelectTitle: 'Ta ni ó ń kọ́ ẹ̀kọ́ lónìí?',
    childSelectSubtitle: 'Yan profaili láti tẹ̀síwájú',
    childSelectAdd: 'Fi Ọmọ Mìíràn Kún',
    childSelectContinue: 'Tẹ̀síwájú',
    parentDashTitle: 'Dashboard Obi',
    parentDashProgress: 'Ìlọsíwájú',
    parentDashSessions: 'Àwọn Ìpáde Lẹ́ẹ̀kọ̀ọ̀í',
    parentDashNoData: 'Kò sí ìpáde sibẹsibẹ',
    parentDashSubject: 'Kókó Ẹ̀kọ́',
    parentDashScore: 'Àmì',
    parentDashDate: 'Ọjọ́',
    personalityTitle: 'Yan Olùkọ́ Rẹ',
    personalitySubtitle: 'Yan olùkọ́ tí ó bá ọ mu',
    personalitySelect: 'Yan',
    personalitySelected: 'Ti yan',
    progressTitle: 'Ìlọsíwájú Mi',
    progressXP: 'Àpapọ̀ XP',
    progressStreak: 'Ọjọ́ Tẹ̀síwájú',
    progressLessons: 'Àwọn Ẹ̀kọ́ Tí a Parí',
    progressBestScore: 'Àmì Tí ó Ga Jù',
    progressAchievements: 'Àṣeyọrí',
    achievementsTitle: 'Àṣeyọrí',
    achievementsLocked: 'Títìpa',
    achievementsUnlocked: 'Ti ṣí',
    achievementsProgress: 'Tẹ̀síwájú láti ṣí síwájú sii!',
    settingsTitle: 'Ètò',
    settingsParentZone: 'Agbègbè Obi',
    settingsForChild: 'Fún Ọmọ',
    settingsAppPrefs: 'Àyàn Áàpù',
    settingsAbout: 'Nípa & Ìrànlọ́wọ́',
    settingsSignOut: 'Jáde',
    settingsDarkMode: 'Àkókò Dúdú',
    settingsLanguage: 'Èdè',
    settingsGrade: 'Kíláàsì',
    settingsChangePIN: 'Yí Ọ̀rọ̀ Aṣínà Obi Padà',
    settingsManageChildren: 'Ṣàkóso Àwọn Ọmọ',
    parentGateTitle: 'Agbègbè Obi',
    parentGateSubtitle: 'Tẹ ọ̀rọ̀ aṣínà rẹ láti tẹ̀síwájú',
    parentGateSetupTitle: 'Ṣẹ̀dá PIN Obi Rẹ',
    parentGateSetupSubtitle: 'Ṣètò PIN oní-nọ́mbà 4 láti dáàbò bo Agbègbè Obi',
    parentGateSetPIN: 'Ṣètò PIN',
    parentGateEnter: 'Tẹ PIN',
    parentGateWrong: 'PIN kò tọ̀. Gbìyànjú lẹ́ẹ̀kan síi.',
    parentGateHint: 'Yí PIN rẹ padà ní Ètò',
    childSwitcherTitle: 'Yí Ọmọ Padà',
    childSwitcherActive: 'Ní lọ́wọ́lọ́wọ́',
    offlineBanner: 'O wa offline',
    offlineBannerSub: 'Ń lo àkóónú tí a fi pamọ́',
    offlineTitle: 'Ipò Offline',
    offlineQuiz: 'Ìdánwò Àdánwò',
    offlineFlashcards: 'Àwọn Káàdì',
    offlineBack: 'Padà',
    progressShort: 'Ìṣirò',
    achievementsShort: 'Ẹ̀bùn',
    settingsShort: 'Sii',
    childrenShort: 'Ọmọ',
  },
  ig: {
    home: 'Ụlọ',
    learn: 'Mụta',
    progress: 'Ọganihu M',
    achievements: 'Ihe Nzụlite',
    myTutor: 'Onye Nkuzi M',
    children: 'Ụmụaka',
    reports: 'Akụkọ',
    signOut: 'Pụọ',
    goodMorning: 'Ụtụtụ ọma',
    goodAfternoon: 'Ehihie ọma',
    goodEvening: 'Anyasị ọma',
    welcomeBack: 'Nnọọ laghachi',
    askAI: 'Jụọ AI — gịnị i chọrọ ịmụta taa?',
    aiPickForYou: 'NHỌRỌ AI MÀ GỊ',
    startLesson: 'Bido →',
    dailyMission: 'Ọrụ Ụbọchị',
    subjects: 'Ihe Mmụta',
    languages: 'Asụsụ',
    softSkills: 'Nka Ndụ',
    askAnything: 'Jụọ ihe ọ bụla...',
    startQuiz: 'Bido Nnwale',
    welcomeBackAuth: 'Nnọọ laghachi 🎉',
    signInToContinue: 'Banye iji gaa n\'ihu ịmụta',
    emailAddress: 'Adreesị ozi-e',
    password: 'Okwuntughe',
    keepSignedIn: 'Jide m banye',
    forgotPassword: 'Chefuo okwuntughe?',
    signIn: 'Banye →',
    noAccount: 'Enweghị akaụntụ?',
    signUpFree: 'Debanye aha n\'efu',
    orSignInWith: 'ma ọ bụ banye site na',
    myProgress: 'Ọganihu M',
    streak: 'Ụbọchị n\'ihu',
    totalXP: 'Ngụkọta XP',
    loading: 'Na-ebu...',
    error: 'Ihe mere ụfọdụ',
    retry: 'Nwaa ọzọ',
    save: 'Chekwaa',
    cancel: 'Kagbuo',
    confirm: 'Kwenye',
    back: 'Laghachi',
    next: 'Gaa n\'ihu',
    done: 'Mechaa',
    start: 'Bido',
    correct: 'Ọ dị mma! ✓',
    incorrect: 'Ọ ezughị ezu. Nwaa ọzọ!',
    score: 'Akara',
    level: 'Ọkwa',
    forgotPasswordTitle: 'Chefuo Okwuntughe',
    forgotPasswordSubtitle: 'Tinye ozi-e gị anyị ga-ezitere gị njikọ nrụgharị',
    forgotPasswordButton: 'Ziga Njikọ Nrụgharị',
    forgotPasswordSuccess: 'Lelee ozi-e gị maka njikọ nrụgharị',
    forgotPasswordBack: 'Laghachi na Nbanye',
    changePinTitle: 'Gbanwee PIN nke Nne na Nna',
    changePinCurrent: 'PIN Ugbu A',
    changePinNew: 'PIN Ọhụrụ',
    changePinConfirm: 'Kwenye PIN Ọhụrụ',
    changePinButton: 'Melite PIN',
    changePinSuccess: 'Emelitere PIN!',
    changePinSuccessMsg: 'Agbanweela PIN Parent Portal gị nke ọma.',
    childrenTitle: 'Jikwaa Ụmụaka',
    childrenAdd: 'Tinye Nwa',
    childrenEmpty: 'Enweghị ụmụaka etinyere',
    childrenEmptySubtitle: 'Tinye nwa gị mbụ iji malite',
    childrenName: 'Aha Nwa',
    childrenGrade: 'Klaasị',
    childrenSave: 'Chekwaa',
    childrenDelete: 'Hichapụ',
    childrenEdit: 'Dezie',
    childSelectTitle: 'Onye na-azụ ụka taa?',
    childSelectSubtitle: 'Họrọ profaịlụ iji gaa n\'ihu',
    childSelectAdd: 'Tinye Nwa Ọzọ',
    childSelectContinue: 'Gaa n\'ihu',
    parentDashTitle: 'Dashboard Nne na Nna',
    parentDashProgress: 'Ọganihu',
    parentDashSessions: 'Oge Nso A Hụrụ',
    parentDashNoData: 'Enweghị oge ọ bụla',
    parentDashSubject: 'Isiokwu',
    parentDashScore: 'Akara',
    parentDashDate: 'Ụbọchị',
    personalityTitle: 'Họrọ Onye Nkuzi Gị',
    personalitySubtitle: 'Họrọ onye nkuzi kachasị mma gị',
    personalitySelect: 'Họrọ',
    personalitySelected: 'Ahọpụtara',
    progressTitle: 'Ọganihu M',
    progressXP: 'Ngụkọta XP',
    progressStreak: 'Ụbọchị n\'otu n\'ihu',
    progressLessons: 'Ihe Mmụta Emechara',
    progressBestScore: 'Akara Kachasị Mma',
    progressAchievements: 'Ihe Nzụlite',
    achievementsTitle: 'Ihe Nzụlite',
    achievementsLocked: 'Kpọchiri',
    achievementsUnlocked: 'Emegheere',
    achievementsProgress: 'Gaa n\'ihu iji mepee ọzọ!',
    settingsTitle: 'Ntọala',
    settingsParentZone: 'Mpaghere Nne na Nna',
    settingsForChild: 'Maka Nwa',
    settingsAppPrefs: 'Mmasị Ngwa',
    settingsAbout: 'Banyere & Nkwado',
    settingsSignOut: 'Pụọ',
    settingsDarkMode: 'Ọnọdụ Ọchịchịrị',
    settingsLanguage: 'Asụsụ',
    settingsGrade: 'Klaasị',
    settingsChangePIN: 'Gbanwee PIN nke Nne na Nna',
    settingsManageChildren: 'Jikwaa Ụmụaka',
    parentGateTitle: 'Mpaghere Nne na Nna',
    parentGateSubtitle: 'Tinye PIN gị iji gaa n\'ihu',
    parentGateSetupTitle: 'Mepụta PIN Nne na Nna',
    parentGateSetupSubtitle: 'Hazie PIN ọnụọgụ 4 iji chebe Mpaghere Nne na Nna',
    parentGateSetPIN: 'Hazie PIN',
    parentGateEnter: 'Tinye PIN',
    parentGateWrong: 'PIN ezighi ezi. Nwaa ọzọ.',
    parentGateHint: 'Gbanwee PIN gị na Ntọala',
    childSwitcherTitle: 'Gbanwee Nwa',
    childSwitcherActive: 'Na-arụ ọrụ',
    offlineBanner: 'Ị nọghị n\'ịntanetị',
    offlineBannerSub: 'Na-eji ndịnaya echekwara',
    offlineTitle: 'Ọnọdụ Offline',
    offlineQuiz: 'Ajụjụ Mmụta',
    offlineFlashcards: 'Kaadị Echeta',
    offlineBack: 'Laghachi',
    progressShort: 'Ọnụọgụ',
    achievementsShort: 'Ihe nrite',
    settingsShort: 'Ọzọ',
    childrenShort: 'Ụmụ',
  },
};

export type UITextKey = keyof typeof UI_TEXT['en'];

export function t(key: UITextKey, lang: Language): string {
  return UI_TEXT[lang]?.[key] ?? UI_TEXT.en[key];
}

/** Legacy screen copy used by grade, index, lesson, and dashboard extras */
type LegacyUIStrings = {
  appName: string;
  chooseLanguage: string;
  classQuestion: string;
  classSubtitle: string;
  selectClass: string;
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
  appTagline: string;
  createAccount: string;
  joinStudents: string;
  signUp: string;
  alreadyHaveAccount: string;
  signInLink: string;
  fullName: string;
  phoneNumber: string;
  confirmPassword: string;
  privacyNote: string;
  welcomeToLearnova: string;
  todaysLessons: string;
  currentStreak: string;
  completeLessonToday: string;
  missionComplete: string;
  startDailyLesson: string;
  lessonsCompleted: string;
  askTutor: string;
  go: string;
  emailMode: string;
  phoneMode: string;
};

const LEGACY_UI: Record<Language, LegacyUIStrings> = {
  en: {
    appName: 'Learnova',
    chooseLanguage: 'Choose your language to begin:',
    classQuestion: 'What class are you in?',
    classSubtitle: 'Select your Nigerian primary school class',
    selectClass: 'Select Your Class',
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
    appTagline: 'AI-Powered Learning for Nigerian Students',
    createAccount: 'Create your account 🌟',
    joinStudents: 'Join thousands of Nigerian students',
    signUp: 'Sign Up →',
    alreadyHaveAccount: 'Already have an account?',
    signInLink: 'Sign in',
    fullName: 'Your full name',
    phoneNumber: 'Phone number',
    confirmPassword: 'Confirm password',
    privacyNote: '🔐 We never share your data',
    welcomeToLearnova: 'Welcome to Learnova',
    todaysLessons: "Today's lessons",
    currentStreak: 'Current streak',
    completeLessonToday: 'Complete 1 lesson today',
    missionComplete: 'complete',
    startDailyLesson: 'Start your daily lesson here',
    lessonsCompleted: 'lessons completed overall',
    askTutor: 'Ask Tutor',
    go: 'Go →',
    emailMode: '📧 Email',
    phoneMode: '📱 Phone',
  },
  ha: {
    appName: 'Learnova',
    chooseLanguage: 'Zaɓi harshenka don farawa:',
    classQuestion: 'Wane aji kake?',
    classSubtitle: 'Zaɓi ajin firamare naka a Najeriya',
    selectClass: 'Zaɓi Ajinka',
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
    appTagline: 'Koyon AI don Daliban Najeriya',
    createAccount: 'Ƙirƙiri asusu 🌟',
    joinStudents: 'Shiga dubban ɗalibai na Najeriya',
    signUp: 'Yi rajista →',
    alreadyHaveAccount: 'Kana da asusu?',
    signInLink: 'Shiga',
    fullName: 'Cikakken sunanka',
    phoneNumber: 'Lambar waya',
    confirmPassword: 'Tabbatar da kalmar sirri',
    privacyNote: '🔐 Ba mu raba bayananka ba',
    welcomeToLearnova: 'Barka da zuwa Learnova',
    todaysLessons: 'Darussan yau',
    currentStreak: 'Jerin kwanaki',
    completeLessonToday: 'Kammala darasi 1 yau',
    missionComplete: 'an kammala',
    startDailyLesson: 'Fara darasin yau a nan',
    lessonsCompleted: 'darussa da aka kammala',
    askTutor: 'Tambayi Malami',
    go: 'Tafi →',
    emailMode: '📧 Imel',
    phoneMode: '📱 Waya',
  },
  yo: {
    appName: 'Learnova',
    chooseLanguage: 'Yan èdè rẹ láti bẹ̀rẹ̀:',
    classQuestion: 'Kíláàsì wo lo wà?',
    classSubtitle: 'Yan kíláàsì alakọbẹrẹ rẹ ní Naijiria',
    selectClass: 'Yan Kíláàsì Rẹ',
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
    appTagline: 'Ìkẹ́kọ̀ọ́ AI fún Àwọn Akẹ́kọ̀ọ́ Nàìjíríà',
    createAccount: 'Ṣẹ̀dá àkọọ́lẹ̀ rẹ 🌟',
    joinStudents: 'Darapọ̀ mọ́ ẹgbẹẹgbẹ̀rún àwọn akẹ́kọ̀ọ́ Nàìjíríà',
    signUp: 'Forúkọsilẹ̀ →',
    alreadyHaveAccount: 'Ṣé o ní àkọọ́lẹ̀ tẹ́lẹ̀?',
    signInLink: 'Wọlé',
    fullName: 'Orúkọ rẹ kíkún',
    phoneNumber: 'Nọ́mbà fóònù',
    confirmPassword: 'Jẹ́ ìmúdájú ọ̀rọ̀ aṣínà',
    privacyNote: '🔐 A kò pín dátà rẹ pẹ̀lú ẹnìkẹ́ni',
    welcomeToLearnova: 'Ẹ káàbọ̀ sí Learnova',
    todaysLessons: 'Àwọn ẹ̀kọ́ òní',
    currentStreak: 'Ìtẹ̀lé ọjọ́',
    completeLessonToday: 'Parí ẹ̀kọ́ 1 lónìí',
    missionComplete: 'parí',
    startDailyLesson: 'Bẹ̀rẹ̀ ẹ̀kọ́ òjọ́ rẹ níbí',
    lessonsCompleted: 'àwọn ẹ̀kọ́ tí a parí',
    askTutor: 'Béèrè Olùkọ́',
    go: 'Lọ →',
    emailMode: '📧 Ìméèlì',
    phoneMode: '📱 Fóònù',
  },
  ig: {
    appName: 'Learnova',
    chooseLanguage: 'Họrọ asụsụ gị ka ịmalite:',
    classQuestion: 'Klaasị ole ka ị nọ?',
    classSubtitle: 'Họrọ klaasị praịmarị gị na Naịjịrịa',
    selectClass: 'Họrọ Klaasị Gị',
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
    appTagline: 'Ọmụmụ AI maka Ụmụ Akwụkwọ Naịjịrịa',
    createAccount: 'Mepụta akaụntụ gị 🌟',
    joinStudents: 'Sonye puku ndị ọmụ akwụkwọ Naịjịrịa',
    signUp: 'Debanye aha →',
    alreadyHaveAccount: 'Ị nwere akaụntụ?',
    signInLink: 'Banye',
    fullName: 'Aha gị zuru ezu',
    phoneNumber: 'Nọmba ekwentị',
    confirmPassword: 'Kwenye okwuntughe',
    privacyNote: '🔐 Anyị anaghị ekekọrịta data gị',
    welcomeToLearnova: 'Nnọọ na Learnova',
    todaysLessons: 'Ihe mmụta taa',
    currentStreak: 'Ụbọchị n\'otu n\'ihu',
    completeLessonToday: 'Mecha otu ihe mmụta taa',
    missionComplete: 'mechaa',
    startDailyLesson: 'Bido ihe mmụta gị taa ebe a',
    lessonsCompleted: 'ihe mmụta emechara',
    askTutor: 'Jụọ Onye Nkuzi',
    go: 'Gaa →',
    emailMode: '📧 Ozi-e',
    phoneMode: '📱 Ekwentị',
  },
};

export type FullUIText = typeof UI_TEXT['en'] & LegacyUIStrings;

export function getUIText(lang: Language): FullUIText {
  return { ...UI_TEXT[lang], ...LEGACY_UI[lang] };
}

export interface LanguageMeta {
  code: Language;
  label: string;
  nativeLabel: string;
  greeting: string;
  color: string;
  region: string;
}

export const LANGUAGES: LanguageMeta[] = [
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

export const LANGUAGE_PROMPTS: Record<Language, string> = {
  en: 'Respond only in clear, simple English suitable for Nigerian primary school students.',
  yo: 'Dahun ni Yorùbá péré. Lo ọrọ̀ tó rọrùn fún àwọn ọmọ ilé ẹ̀kọ́ alakọbẹrẹ ní Naijiria.',
  ig: 'Zaa naanị n’asụsụ Igbo. Jiri okwu dị mfe maka ụmụ akwụkwọ praịmarị na Naịjịrịa.',
  ha: 'Amsa da Hausa kawai. Yi amfani da kalmomi masu sauki ga daliban firamare a Najeriya.',
};

export const getGreeting = (
  langCode: Language,
  subject: string,
  grade: number
): string => {
  const greetings: Record<Language, string> = {
    en: `Hello! I am your Learnova AI teacher. Let us learn ${subject} for Primary ${grade}. What would you like to start with?`,
    yo: `Ẹ káàbọ̀! Mo jẹ olùkọ́ AI rẹ ní Learnova. Jẹ́ ká kọ́ ${subject} fún Primary ${grade}. Kí ni o fẹ́ bẹ̀rẹ̀ pẹ̀lú?`,
    ig: `Nnọọ! Abụ m onye nkuzi AI gị na Learnova. Ka anyị mụta ${subject} maka Primary ${grade}. Gịnị ka ị chọrọ ibido?`,
    ha: `Sannu! Ni ne malamin AI ɗinka a Learnova. Mu koya ${subject} don Primary ${grade}. Me kake son fara da shi?`,
  };
  return greetings[langCode];
};
