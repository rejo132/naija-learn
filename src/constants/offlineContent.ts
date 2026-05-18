export interface OfflineQuiz {
  id: string;
  subject: string;
  grade: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface OfflineFlashcard {
  id: string;
  subject: string;
  grade: number;
  front: string;
  back: string;
  emoji: string;
}

export interface OfflineActivity {
  id: string;
  type: 'quiz' | 'flashcard' | 'counting' | 'spelling';
  title: string;
  emoji: string;
  grade: number;
  subject: string;
}

export const OFFLINE_QUIZZES: OfflineQuiz[] = [
  {
    id: 'math_001',
    subject: 'Mathematics',
    grade: 1,
    question: 'Chidi has 3 mangoes. Amina gives him 2 more. How many mangoes does Chidi have now?',
    options: ['4', '5', '6', '3'],
    correct: 1,
    explanation: '3 + 2 = 5 mangoes',
  },
  {
    id: 'math_002',
    subject: 'Mathematics',
    grade: 1,
    question: 'A Keke Napep carries 3 passengers. Another Keke carries 4. How many passengers in total?',
    options: ['6', '7', '8', '5'],
    correct: 1,
    explanation: '3 + 4 = 7 passengers',
  },
  {
    id: 'math_003',
    subject: 'Mathematics',
    grade: 2,
    question: 'Yetunde bought 10 oranges. She ate 4. How many are left?',
    options: ['5', '6', '7', '8'],
    correct: 1,
    explanation: '10 - 4 = 6 oranges left',
  },
  {
    id: 'math_004',
    subject: 'Mathematics',
    grade: 2,
    question: 'What is 5 × 3?',
    options: ['10', '12', '15', '20'],
    correct: 2,
    explanation: '5 × 3 = 15',
  },
  {
    id: 'math_005',
    subject: 'Mathematics',
    grade: 3,
    question: 'A trader has ₦500. She spends ₦275. How much is left?',
    options: ['₦225', '₦235', '₦215', '₦250'],
    correct: 0,
    explanation: '500 - 275 = ₦225',
  },
  {
    id: 'math_006',
    subject: 'Mathematics',
    grade: 4,
    question: 'What is 12 × 12?',
    options: ['124', '134', '144', '154'],
    correct: 2,
    explanation: '12 × 12 = 144',
  },
  {
    id: 'math_007',
    subject: 'Mathematics',
    grade: 5,
    question: 'What is 25% of 200?',
    options: ['25', '50', '75', '100'],
    correct: 1,
    explanation: '25% of 200 = 200 ÷ 4 = 50',
  },
  {
    id: 'math_008',
    subject: 'Mathematics',
    grade: 6,
    question: 'A rectangle is 8cm long and 5cm wide. What is its area?',
    options: ['26cm²', '30cm²', '40cm²', '45cm²'],
    correct: 2,
    explanation: 'Area = length × width = 8 × 5 = 40cm²',
  },
  {
    id: 'eng_001',
    subject: 'English Language',
    grade: 1,
    question: 'Which word rhymes with "cat"?',
    options: ['dog', 'hat', 'cup', 'big'],
    correct: 1,
    explanation: 'Cat and hat both end in "-at"',
  },
  {
    id: 'eng_002',
    subject: 'English Language',
    grade: 2,
    question: 'Choose the correct spelling:',
    options: ['beutiful', 'beautiful', 'beautifull', 'beautyful'],
    correct: 1,
    explanation: 'The correct spelling is "beautiful"',
  },
  {
    id: 'eng_003',
    subject: 'English Language',
    grade: 3,
    question: 'What is the plural of "child"?',
    options: ['childs', 'childes', 'children', 'childrens'],
    correct: 2,
    explanation: 'The plural of child is children',
  },
  {
    id: 'eng_004',
    subject: 'English Language',
    grade: 4,
    question: 'Which sentence is correct?',
    options: [
      'She go to school every day.',
      'She goes to school every day.',
      'She going to school every day.',
      'She gone to school every day.',
    ],
    correct: 1,
    explanation: 'We use "goes" for she/he/it in present tense',
  },
  {
    id: 'sci_001',
    subject: 'Basic Science',
    grade: 2,
    question: 'Which of these is a living thing?',
    options: ['Stone', 'Water', 'Mango tree', 'Sand'],
    correct: 2,
    explanation: 'A mango tree grows, breathes and reproduces — it is living',
  },
  {
    id: 'sci_002',
    subject: 'Basic Science',
    grade: 3,
    question: 'What do plants need to make their own food?',
    options: [
      'Rain and sand',
      'Sunlight, water and air',
      'Soil and stones',
      'Fire and water',
    ],
    correct: 1,
    explanation: 'Plants use sunlight, water and CO₂ for photosynthesis',
  },
  {
    id: 'sci_003',
    subject: 'Basic Science',
    grade: 4,
    question: 'What is the boiling point of water?',
    options: ['0°C', '50°C', '100°C', '200°C'],
    correct: 2,
    explanation: 'Water boils at 100 degrees Celsius',
  },
  {
    id: 'soc_001',
    subject: 'Social Studies',
    grade: 2,
    question: 'What is the capital city of Nigeria?',
    options: ['Lagos', 'Abuja', 'Kano', 'Ibadan'],
    correct: 1,
    explanation: 'Abuja is the federal capital territory of Nigeria',
  },
  {
    id: 'soc_002',
    subject: 'Social Studies',
    grade: 3,
    question: 'How many states are in Nigeria?',
    options: ['30', '34', '36', '40'],
    correct: 2,
    explanation: 'Nigeria has 36 states and the FCT Abuja',
  },
  {
    id: 'soc_003',
    subject: 'Social Studies',
    grade: 4,
    question: 'What are the colours on the Nigerian flag?',
    options: [
      'Red, White and Blue',
      'Green and White',
      'Green, White and Red',
      'Blue and Green',
    ],
    correct: 1,
    explanation: 'The Nigerian flag has two green stripes and one white stripe',
  },
];

export const OFFLINE_FLASHCARDS: OfflineFlashcard[] = [
  { id: 'fc_001', subject: 'Mathematics', grade: 1, front: '2 + 2 = ?', back: '4', emoji: '🔢' },
  { id: 'fc_002', subject: 'Mathematics', grade: 1, front: '5 + 3 = ?', back: '8', emoji: '🔢' },
  { id: 'fc_003', subject: 'Mathematics', grade: 2, front: '3 × 4 = ?', back: '12', emoji: '✖️' },
  { id: 'fc_004', subject: 'Mathematics', grade: 2, front: '10 - 6 = ?', back: '4', emoji: '➖' },
  { id: 'fc_005', subject: 'English Language', grade: 1, front: 'What sound does "A" make?', back: 'Ah (as in Apple)', emoji: '🔤' },
  { id: 'fc_006', subject: 'English Language', grade: 2, front: 'Opposite of "big"?', back: 'Small', emoji: '🔤' },
  { id: 'fc_007', subject: 'Basic Science', grade: 3, front: 'What gas do plants absorb?', back: 'Carbon Dioxide (CO₂)', emoji: '🌿' },
  { id: 'fc_008', subject: 'Social Studies', grade: 3, front: 'Capital of Nigeria?', back: 'Abuja', emoji: '🗺️' },
  { id: 'fc_009', subject: 'Social Studies', grade: 4, front: 'Nigeria independence date?', back: 'October 1st, 1960', emoji: '🇳🇬' },
  { id: 'fc_010', subject: 'Mathematics', grade: 3, front: '7 × 8 = ?', back: '56', emoji: '✖️' },
];

export function getOfflineQuizzes(grade: number, subject?: string): OfflineQuiz[] {
  return OFFLINE_QUIZZES.filter(
    (q) =>
      q.grade <= grade &&
      (!subject || q.subject.toLowerCase().includes(subject.toLowerCase()))
  );
}

export function getOfflineFlashcards(grade: number, subject?: string): OfflineFlashcard[] {
  return OFFLINE_FLASHCARDS.filter(
    (f) =>
      f.grade <= grade &&
      (!subject || f.subject.toLowerCase().includes(subject.toLowerCase()))
  );
}
