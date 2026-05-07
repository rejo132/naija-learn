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
  { id: 'hygiene', label: 'Hygiene and Health', icon: '🧼', color: '#0f766e', bgColor: '#ccfbf1', category: 'softskill', description: 'Stay clean and healthy' },
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

export const getQuickPrompts = (subjectLabel: string, grade: number): string[] => [
  `Teach me about ${subjectLabel} for Primary ${grade}`,
  `Give me an exercise to practice`,
  `Explain using a Nigerian example`,
  `Tell me an interesting story about this`,
  `Quiz me on what I just learned`,
];