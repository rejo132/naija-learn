/**
 * Curriculum and lesson content types.
 * Aligned to Nigeria NERDC/UBEC primary school curriculum.
 */

/**
 * A school subject offered in the curriculum (e.g. Mathematics, English).
 */
export interface Subject {
  /** Unique identifier for the subject. */
  id: string;
  /** Default display name in English. */
  name: string;
  /** Localized names keyed by language code (e.g. `yoruba`, `igbo`). */
  translatedName: Record<string, string>;
  /** Icon asset name or URL for UI tiles. */
  icon: string;
  /** Background color token or hex for subject cards. */
  bgColor: string;
  /** Primary grades (1–6) where this subject is taught. */
  grades: number[];
  /** Curriculum grouping: core academics, language, or life skills. */
  category: 'core' | 'language' | 'lifeskills';
}

/**
 * A teachable unit within a subject for a specific grade.
 */
export interface Topic {
  /** Unique identifier for the topic. */
  id: string;
  /** Human-readable topic title. */
  name: string;
  /** Parent subject this topic belongs to. */
  subjectId: string;
  /** Grade level (1–6) this topic targets. */
  grade: number;
  /** Whether the child has finished this topic. */
  isCompleted: boolean;
  /** Mastery percentage from quizzes and practice (0–100). */
  masteryScore: number;
}

/**
 * A single multiple-choice question used in lessons or quizzes.
 */
export interface QuizQuestion {
  /** Unique identifier for the question. */
  id: string;
  /** Question stem shown to the learner. */
  text: string;
  /** Four answer choices labeled A–D. */
  options: { A: string; B: string; C: string; D: string };
  /** Letter of the correct option. */
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  /** Short explanation shown after answering. */
  explanation: string;
}
