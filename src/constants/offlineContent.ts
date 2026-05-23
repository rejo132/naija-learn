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
  {
    id: 'math_offline_1',
    subject: 'Mathematics',
    grade: 3,
    question: 'What is 7 × 8?',
    options: ['54', '56', '64', '48'],
    correct: 1,
    explanation: '7 × 8 = 56. Count by 7s: 7, 14, 21, 28, 35, 42, 49, 56! 🔢',
  },
  {
    id: 'math_offline_2',
    subject: 'Mathematics',
    grade: 3,
    question: 'What is half of 100?',
    options: ['25', '75', '50', '40'],
    correct: 2,
    explanation: 'Half means divide by 2. 100 ÷ 2 = 50! ✂️',
  },
  {
    id: 'math_offline_3',
    subject: 'Mathematics',
    grade: 3,
    question: 'How many sides does a triangle have?',
    options: ['2', '3', '4', '5'],
    correct: 1,
    explanation: 'A triangle has 3 sides and 3 corners! 🔺',
  },
  {
    id: 'math_offline_4',
    subject: 'Mathematics',
    grade: 3,
    question: 'What comes after 199?',
    options: ['200', '210', '198', '201'],
    correct: 0,
    explanation: '199 + 1 = 200! You are counting into the hundreds! 🎉',
  },
  {
    id: 'math_offline_5',
    subject: 'Mathematics',
    grade: 3,
    question: 'Which number is the biggest?',
    options: ['67', '76', '69', '70'],
    correct: 1,
    explanation: '76 is the biggest! Compare the tens digit first: 7 > 6! 📊',
  },
  {
    id: 'science_offline_1',
    subject: 'Basic Science',
    grade: 3,
    question: 'Which planet do we live on?',
    options: ['Mars', 'Venus', 'Earth', 'Jupiter'],
    correct: 2,
    explanation: 'We live on Earth — the third planet from the Sun! 🌍',
  },
  {
    id: 'science_offline_2',
    subject: 'Basic Science',
    grade: 3,
    question: 'What do plants need to make food?',
    options: ['Moonlight', 'Sunlight', 'Darkness', 'Wind'],
    correct: 1,
    explanation:
      'Plants use sunlight, water, and air to make food. This is called photosynthesis! 🌱',
  },
  {
    id: 'science_offline_3',
    subject: 'Basic Science',
    grade: 3,
    question: 'How many legs does an insect have?',
    options: ['4', '8', '6', '10'],
    correct: 2,
    explanation: 'All insects have exactly 6 legs! 🐛',
  },
  {
    id: 'science_offline_4',
    subject: 'Basic Science',
    grade: 3,
    question: 'What state of matter is ice?',
    options: ['Gas', 'Liquid', 'Solid', 'Plasma'],
    correct: 2,
    explanation: 'Ice is frozen water — a solid! When it melts it becomes liquid water. 🧊',
  },
  {
    id: 'science_offline_5',
    subject: 'Basic Science',
    grade: 3,
    question: 'Which organ pumps blood around the body?',
    options: ['Brain', 'Lungs', 'Heart', 'Stomach'],
    correct: 2,
    explanation: 'The heart pumps blood to every part of your body! ❤️',
  },
  {
    id: 'social_offline_1',
    subject: 'Social Studies',
    grade: 3,
    question: 'What is the capital city of Nigeria?',
    options: ['Lagos', 'Kano', 'Abuja', 'Port Harcourt'],
    correct: 2,
    explanation: 'Abuja is the capital city of Nigeria! It became the capital in 1991. 🇳🇬',
  },
  {
    id: 'social_offline_2',
    subject: 'Social Studies',
    grade: 3,
    question: 'How many states are in Nigeria?',
    options: ['30', '36', '38', '40'],
    correct: 1,
    explanation: 'Nigeria has 36 states plus the FCT (Abuja)! 🗺️',
  },
  {
    id: 'social_offline_3',
    subject: 'Social Studies',
    grade: 3,
    question: 'Which of these is a means of transportation?',
    options: ['Television', 'Bicycle', 'Radio', 'Chair'],
    correct: 1,
    explanation:
      'A bicycle is used to move from one place to another — that makes it transportation! 🚲',
  },
  {
    id: 'social_offline_4',
    subject: 'Social Studies',
    grade: 3,
    question: 'What do we call the leader of Nigeria?',
    options: ['Prime Minister', 'King', 'President', 'Governor'],
    correct: 2,
    explanation:
      'Nigeria is led by a President! The president is the head of the Federal Government. 🏛️',
  },
  {
    id: 'social_offline_5',
    subject: 'Social Studies',
    grade: 3,
    question: 'Which of these is a natural resource in Nigeria?',
    options: ['Plastic', 'Crude oil', 'Glass', 'Paper'],
    correct: 1,
    explanation: "Crude oil is one of Nigeria's most important natural resources! ⛽",
  },
  {
    id: 'civic_offline_1',
    subject: 'Civic Education',
    grade: 3,
    question: 'What is a right?',
    options: [
      'Something you must do',
      'Something you are allowed to have or do',
      'A type of punishment',
      'A school subject',
    ],
    correct: 1,
    explanation:
      'A right is something every person is allowed to have or do, like the right to education! 📚',
  },
  {
    id: 'civic_offline_2',
    subject: 'Civic Education',
    grade: 3,
    question: 'What is a responsibility?',
    options: [
      'Something you earn',
      'A type of game',
      'A duty you must carry out',
      'A kind of reward',
    ],
    correct: 2,
    explanation:
      'A responsibility is a duty — something you should do, like keeping your environment clean! 🌿',
  },
  {
    id: 'civic_offline_3',
    subject: 'Civic Education',
    grade: 3,
    question: 'Which of these is a national symbol of Nigeria?',
    options: ['The Eiffel Tower', 'The Niger River', 'Big Ben', 'The Pyramids'],
    correct: 1,
    explanation:
      'The River Niger is a major national symbol of Nigeria — our country is named after it! 🌊',
  },
  {
    id: 'civic_offline_4',
    subject: 'Civic Education',
    grade: 3,
    question: 'What does a good citizen do?',
    options: [
      'Litters everywhere',
      'Disobeys rules',
      'Respects others and follows the law',
      "Takes other people's things",
    ],
    correct: 2,
    explanation:
      'A good citizen respects others, follows the law, and helps their community! 🤝',
  },
  {
    id: 'civic_offline_5',
    subject: 'Civic Education',
    grade: 3,
    question: 'In which year did Nigeria gain independence?',
    options: ['1957', '1963', '1960', '1970'],
    correct: 2,
    explanation: 'Nigeria became independent on October 1, 1960! We celebrate this every year. 🎉',
  },
];

function matchesSubject(quizSubject: string, filter?: string): boolean {
  if (!filter) return true;
  const q = quizSubject.toLowerCase();
  const f = filter.toLowerCase();
  return q === f || q.includes(f) || f.includes(q);
}

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
  const byGrade = OFFLINE_QUIZZES.filter((q) => q.grade <= grade);
  if (!subject) return byGrade;

  const exact = byGrade.filter((q) => q.subject === subject);
  if (exact.length > 0) return exact;

  const loose = byGrade.filter((q) => matchesSubject(q.subject, subject));
  return loose.length > 0 ? loose : byGrade;
}

export function getOfflineFlashcards(grade: number, subject?: string): OfflineFlashcard[] {
  const byGrade = OFFLINE_FLASHCARDS.filter((f) => f.grade <= grade);
  if (!subject) return byGrade;

  const exact = byGrade.filter((f) => f.subject === subject);
  if (exact.length > 0) return exact;

  const loose = byGrade.filter((f) => matchesSubject(f.subject, subject));
  return loose.length > 0 ? loose : byGrade;
}
