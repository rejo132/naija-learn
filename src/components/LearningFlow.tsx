import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FONT_SIZES, SPACING, RADIUS, COLORS } from '@/constants/theme';
import { useSpeech } from '@/hooks/useSpeech';
import { saveProgress, updateChildStats } from '@/services/dbService';
import { useAppStore } from '@/store/appStore';
import { LearningFlowState, type LearningFlowStep } from '@/types/ai.types';

interface LearningFlowProps {
  subject: { label: string; emoji: string; color?: string };
  grade: number;
  personality: { name: string; emoji: string };
  onComplete: (state: LearningFlowState) => void;
  onSkip: () => void;
}

const HOOK_LESSONS: Record<string, Record<number, {
  title: string;
  story: string;
  keyPoints: string[];
}>> = {
  Mathematics: {
    1: {
      title: 'Counting with Mangoes 🥭',
      story: 'Chidi went to the market with his mama. He saw a big basket of mangoes. "How many mangoes are there?" his mama asked. Chidi started counting: 1, 2, 3... Let us count together!',
      keyPoints: ['We count from 1 to 10', 'Each object gets one number', 'The last number tells us how many'],
    },
    2: {
      title: 'Adding at the Market 🛒',
      story: 'Amina has 5 Naira. Her uncle gives her 3 more Naira. How much does she have now? We ADD the numbers together: 5 + 3 = 8!',
      keyPoints: ['Addition means putting together', 'The + sign means add', 'The answer is called the sum'],
    },
    3: {
      title: 'Sharing Gala Equally 🌭',
      story: 'Tunde has 12 pieces of gala to share with 3 friends equally. How many pieces does each friend get? We DIVIDE: 12 ÷ 3 = 4 pieces each!',
      keyPoints: ['Division means sharing equally', 'The ÷ sign means divide', 'Everyone gets the same amount'],
    },
    4: {
      title: 'Fractions of an Orange 🍊',
      story: 'Ngozi cuts an orange into 4 equal pieces. She eats 1 piece. She ate 1 out of 4 pieces — that is ONE QUARTER or 1/4!',
      keyPoints: ['A fraction shows part of a whole', 'The bottom number shows total parts', 'The top number shows parts taken'],
    },
    5: {
      title: 'Percentages at the Shop 🏪',
      story: 'A shirt costs ₦2000. There is a 25% discount. How much do you save? 25% of 2000 = ₦500 off! You pay only ₦1500.',
      keyPoints: ['% means out of 100', '25% = 25 out of every 100', 'Multiply by the percentage then divide by 100'],
    },
    6: {
      title: 'Algebra with Plantain 🍌',
      story: 'A bunch of plantain costs ₦x. If you buy 3 bunches and pay ₦1500, what is x? 3x = 1500, so x = 500. Each bunch costs ₦500!',
      keyPoints: ['Letters in math represent unknown numbers', 'We solve equations to find the unknown', 'Whatever you do to one side, do to the other'],
    },
  },
  'English Language': {
    1: {
      title: 'The ABCs 🔤',
      story: 'Every word we speak and write is made of letters. There are 26 letters in the English alphabet. Some are VOWELS: A, E, I, O, U. The rest are CONSONANTS!',
      keyPoints: ['There are 26 letters in English', 'Vowels are A E I O U', 'Consonants are all other letters'],
    },
    2: {
      title: 'Building Words 🏗️',
      story: 'Letters join together to make words. C + A + T = CAT 🐱. D + O + G = DOG 🐕. Each letter makes a sound and together they make a word!',
      keyPoints: ['Words are made of letters', 'Each letter makes a sound', 'We blend sounds to read words'],
    },
    3: {
      title: 'Sentences Tell Stories 📖',
      story: 'Emeka runs to school. That is a sentence! A sentence has a SUBJECT (Emeka) and a VERB (runs). It starts with a capital letter and ends with a full stop.',
      keyPoints: ['A sentence has a subject and verb', 'Start with a capital letter', 'End with a full stop or ? or !'],
    },
    4: {
      title: 'Nouns and Verbs 🎭',
      story: 'NOUNS are naming words: dog, Abuja, happiness. VERBS are action words: run, eat, think. "The dog RUNS fast." Dog is a noun, runs is a verb!',
      keyPoints: ['Nouns name people, places, or things', 'Verbs show action or state', 'Every sentence needs both'],
    },
    5: {
      title: 'Comprehension Skills 📚',
      story: 'When we read, we must UNDERSTAND what we read. We look for the MAIN IDEA, find KEY DETAILS, and make INFERENCES — clever guesses from clues in the text!',
      keyPoints: ['Find the main idea', 'Look for key details', 'Use clues to make inferences'],
    },
    6: {
      title: 'Essay Writing ✍️',
      story: 'A good essay has 3 parts: INTRODUCTION (what you will say), BODY (your main points), CONCLUSION (summary). Like building a house — you need a foundation, walls, and roof!',
      keyPoints: ['Introduction, Body, Conclusion', 'Each paragraph has one main idea', 'Use linking words: firstly, however, finally'],
    },
  },
  'Basic Science': {
    1: {
      title: 'Living and Non-Living Things 🌿',
      story: 'Look around you! Some things are ALIVE — they grow, breathe, and move. Plants, animals, and people are living. Stones, water, and chairs are non-living.',
      keyPoints: ['Living things grow and reproduce', 'Living things need food and water', 'Non-living things do not grow'],
    },
    2: {
      title: 'Our Five Senses 👁️',
      story: 'We learn about the world through our 5 SENSES! We SEE with our eyes 👀, HEAR with our ears 👂, SMELL with our nose 👃, TASTE with our tongue 👅, and TOUCH with our skin 🖐️',
      keyPoints: ['We have 5 senses', 'Each sense uses a different body part', 'Senses help us understand our world'],
    },
    3: {
      title: 'Plants Make Their Own Food 🌱',
      story: 'Plants are amazing! They make their own food using SUNLIGHT, WATER, and AIR (CO₂). This is called PHOTOSYNTHESIS. The leaves are like little kitchens!',
      keyPoints: ['Photosynthesis makes food for plants', 'Plants need sunlight, water, and CO₂', 'Leaves are where photosynthesis happens'],
    },
    4: {
      title: 'States of Matter 💧',
      story: 'Everything around us is SOLID, LIQUID, or GAS. Ice is solid 🧊. Water is liquid 💧. Steam is gas ☁️. Heat can change matter from one state to another!',
      keyPoints: ['Matter has 3 states: solid, liquid, gas', 'Heat causes matter to change state', 'Water can be all 3 states'],
    },
    5: {
      title: 'The Human Body Systems 🫀',
      story: 'Your body has amazing SYSTEMS working together! The DIGESTIVE system breaks down food. The CIRCULATORY system pumps blood. The RESPIRATORY system helps you breathe!',
      keyPoints: ['Body systems work together', 'Each system has a specific job', 'All systems are connected'],
    },
    6: {
      title: 'Electricity and Circuits 💡',
      story: 'Electricity flows like water in a river — but only if the path is COMPLETE. A CIRCUIT is a closed loop. Break the loop and the light goes off!',
      keyPoints: ['Electricity flows in circuits', 'Circuit must be complete (closed)', 'Conductors carry electricity; insulators block it'],
    },
  },
};

function getHookLesson(subject: string, grade: number) {
  const subjectKey = Object.keys(HOOK_LESSONS).find((k) =>
    subject.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().split(' ').some((word) => word.length > 2 && subject.toLowerCase().includes(word))
  ) ?? 'Mathematics';
  const gradeKey = grade as 1 | 2 | 3 | 4 | 5 | 6;
  return (
    HOOK_LESSONS[subjectKey]?.[gradeKey] ??
    HOOK_LESSONS[subjectKey]?.[1] ??
    HOOK_LESSONS.Mathematics[1]
  );
}

const PRACTICE_QUESTIONS: Record<string, Record<number, Array<{
  question: string;
  options: string[];
  correct: number;
  hint: string;
  simpler?: string;
}>>> = {
  Mathematics: {
    1: [
      {
        question: 'Chidi has 4 mangoes. Mama gives him 2 more. How many?',
        options: ['5', '6', '7', '8'],
        correct: 1,
        hint: 'Count all the mangoes together: 4... 5... 6',
        simpler: 'If you have 4 things and get 2 more, you count: 4, then 5, then 6',
      },
      {
        question: 'How many fingers on 2 hands?',
        options: ['8', '9', '10', '12'],
        correct: 2,
        hint: 'Count the fingers on one hand: 5. Now double it!',
        simpler: '5 fingers on one hand + 5 fingers on other hand = ?',
      },
    ],
    2: [
      {
        question: 'Amina has 10 Naira and spends 4. How much is left?',
        options: ['4', '5', '6', '7'],
        correct: 2,
        hint: 'Start at 10 and count back 4 steps',
        simpler: '10 minus 4: start at 10, take away 1, 2, 3, 4...',
      },
      {
        question: 'What is 3 × 4?',
        options: ['10', '11', '12', '14'],
        correct: 2,
        hint: '3 groups of 4: 4 + 4 + 4 = ?',
        simpler: 'Count by 4s: 4, 8, 12 (three times)',
      },
    ],
    3: [
      {
        question: 'Tunde shares 15 oranges among 3 friends equally. How many each?',
        options: ['3', '4', '5', '6'],
        correct: 2,
        hint: 'How many times does 3 go into 15?',
        simpler: 'Count by 3s until you reach 15: 3, 6, 9, 12, 15 — that is 5 times',
      },
      {
        question: 'What is 24 ÷ 6?',
        options: ['3', '4', '5', '6'],
        correct: 1,
        hint: '6 × ? = 24',
        simpler: 'Count by 6s: 6, 12, 18, 24 — that is 4 times',
      },
    ],
    4: [
      {
        question: 'Ngozi eats 3 out of 8 slices of bread. What fraction did she eat?',
        options: ['1/3', '3/5', '3/8', '8/3'],
        correct: 2,
        hint: 'Fraction = parts eaten ÷ total parts',
        simpler: 'She ate 3 slices. There were 8 slices total. Write 3 on top and 8 on the bottom',
      },
      {
        question: 'What is half of 24?',
        options: ['10', '11', '12', '13'],
        correct: 2,
        hint: 'Half means divide by 2',
        simpler: '24 ÷ 2 = ? Think: what number + what number = 24?',
      },
    ],
    5: [
      {
        question: 'What is 20% of 500?',
        options: ['50', '100', '150', '200'],
        correct: 1,
        hint: '20% means 20 out of every 100. So 500 ÷ 100 × 20',
        simpler: 'First find 10% of 500 (÷10 = 50). Then double it for 20%',
      },
      {
        question: 'A rectangle is 6cm × 4cm. What is its area?',
        options: ['20cm²', '22cm²', '24cm²', '26cm²'],
        correct: 2,
        hint: 'Area = length × width',
        simpler: 'Multiply 6 by 4',
      },
    ],
    6: [
      {
        question: 'If 2x = 16, what is x?',
        options: ['6', '7', '8', '9'],
        correct: 2,
        hint: 'Divide both sides by 2',
        simpler: '2 × ? = 16. What number multiplied by 2 gives 16?',
      },
      {
        question: 'What is 15% of 200?',
        options: ['25', '30', '35', '40'],
        correct: 1,
        hint: '15% = 10% + 5%. Find each separately',
        simpler: '10% of 200 = 20. Half of 10% = 5% = 10. Add them: 20 + 10 = 30',
      },
    ],
  },
};

function getPracticeQuestions(subject: string, grade: number) {
  const subjectKey = Object.keys(PRACTICE_QUESTIONS).find((k) =>
    subject.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().split(' ').some((word) => word.length > 2 && subject.toLowerCase().includes(word))
  ) ?? 'Mathematics';
  const gradeKey = grade as 1 | 2 | 3 | 4 | 5 | 6;
  return (
    PRACTICE_QUESTIONS[subjectKey]?.[gradeKey] ??
    PRACTICE_QUESTIONS.Mathematics[1]
  );
}

export function LearningFlow({
  subject,
  grade,
  personality,
  onComplete,
  onSkip,
}: LearningFlowProps) {
  const { colors, isDarkMode } = useTheme();
  const { speak, stop } = useSpeech('en');
  const [step, setStep] = useState<LearningFlowStep>('hook');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSimpler, setShowSimpler] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [xpEarned, setXpEarned] = useState(0);

  const hookLesson = getHookLesson(subject.label, grade);
  const questions = getPracticeQuestions(subject.label, grade);
  const question = questions[currentQ];

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  function handleAnswer(idx: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (idx === question.correct) {
      setScore((s) => s + 1);
      setAnswers((a) => [...a, idx]);
    } else if (nextAttempts === 1) {
      setTimeout(() => setShowHint(true), 500);
    } else if (nextAttempts >= 2) {
      setTimeout(() => setShowSimpler(true), 500);
    }
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setAttempts(0);
      setShowHint(false);
      setShowSimpler(false);
    } else {
      const xp = Math.round((score / questions.length) * 50);
      setXpEarned(xp);
      setStep('reward');
    }
  }

  async function handleContinueToChat() {
    const finalScore = Math.round((score / questions.length) * 100);
    const { activeChildId } = useAppStore.getState();

    await saveProgress({
      subject: subject.label,
      topic: subject.label,
      score: finalScore,
      grade,
      xpEarned,
      durationSeconds: 0,
      flowCompleted: true,
      childId: activeChildId,
    }).catch(() => {});

    if (activeChildId) {
      const {
        activeChildXP,
        activeChildStreak,
        lastStudyDate,
      } = useAppStore.getState();
      await updateChildStats(
        activeChildId,
        activeChildXP ?? 0,
        activeChildStreak ?? 0,
        lastStudyDate ?? new Date().toISOString().split('T')[0],
      ).catch(() => {});
    }

    onComplete({
      step: 'chat',
      hookCompleted: true,
      practiceScore: score,
      practiceTotal: questions.length,
      practiceAnswers: answers,
      adaptationNeeded: score < questions.length * 0.6,
      rewardShown: true,
      xpEarned,
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip intro →</Text>
      </TouchableOpacity>

      {step === 'hook' && (
        <ScrollView contentContainerStyle={styles.stepContainer}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDotLine} />
            <View style={styles.stepDot} />
            <View style={styles.stepDotLine} />
            <View style={styles.stepDot} />
          </View>

          <Text style={[styles.stepLabel, { color: colors.textMuted }]}>
            STEP 1 OF 3 — INTRODUCTION
          </Text>

          <View style={[styles.tutorCard, { backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF' }]}>
            <View style={styles.tutorHeader}>
              <Text style={styles.tutorEmoji}>{personality.emoji}</Text>
              <View>
                <Text style={[styles.tutorName, { color: colors.textPrimary }]}>
                  {personality.name}
                </Text>
                <Text style={[styles.tutorRole, { color: colors.textMuted }]}>Your AI Tutor</Text>
              </View>
            </View>

            <Text style={[styles.lessonTitle, { color: colors.primary }]}>{hookLesson.title}</Text>

            <Text style={[styles.storyText, { color: colors.textPrimary }]}>{hookLesson.story}</Text>

            <TouchableOpacity
              style={styles.readAloudBtn}
              onPress={() => speak(`${hookLesson.title}. ${hookLesson.story}`)}
              accessibilityLabel="Read this lesson aloud"
            >
              <Text style={styles.readAloudIcon}>🔊</Text>
              <Text style={styles.readAloudText}>Read to me</Text>
            </TouchableOpacity>

            <View style={styles.keyPoints}>
              <Text style={[styles.keyPointsLabel, { color: colors.textMuted }]}>KEY POINTS</Text>
              {hookLesson.keyPoints.map((point, i) => (
                <View key={i} style={styles.keyPointItem}>
                  <Text style={[styles.keyPointBullet, { color: colors.primary }]}>✓</Text>
                  <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>{point}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: colors.primary }]}
            onPress={() => setStep('practice')}
          >
            <Text style={styles.continueBtnText}>I understand — let&apos;s practice! 🎯</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 'practice' && question && (
        <ScrollView contentContainerStyle={styles.stepContainer}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={[styles.stepDotLine, styles.stepDotLineDone]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDotLine} />
            <View style={styles.stepDot} />
          </View>

          <Text style={[styles.stepLabel, { color: colors.textMuted }]}>
            STEP 2 OF 3 — PRACTICE ({currentQ + 1}/{questions.length})
          </Text>

          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(currentQ / questions.length) * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <View style={[styles.questionCard, { backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF' }]}>
            <TouchableOpacity
              style={styles.readQuestionBtn}
              onPress={() => speak(question.question)}
              accessibilityLabel="Read question aloud"
            >
              <Text style={{ fontSize: 18 }}>🔊</Text>
            </TouchableOpacity>
            <Text style={[styles.subjectTag, { color: colors.textMuted }]}>
              {subject.emoji} {subject.label} • Primary {grade}
            </Text>
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>
              {question.question}
            </Text>
          </View>

          {showHint && selectedAnswer !== null && selectedAnswer !== question.correct && (
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>💡 Hint from {personality.name}:</Text>
              <Text style={styles.hintText}>{question.hint}</Text>
            </View>
          )}

          {showSimpler && (
            <View style={styles.simplerBox}>
              <Text style={styles.simplerTitle}>🔍 Let me break it down:</Text>
              <Text style={styles.simplerText}>{question.simpler}</Text>
            </View>
          )}

          {question.options.map((opt, idx) => {
            let bgColor = isDarkMode ? '#1A2420' : '#FFFFFF';
            let borderColor = colors.border;
            let textColor = colors.textPrimary;

            if (selectedAnswer !== null) {
              if (idx === question.correct) {
                bgColor = '#E8F5EE';
                borderColor = COLORS.success;
                textColor = '#005C36';
              } else if (idx === selectedAnswer && idx !== question.correct) {
                bgColor = '#FDECEA';
                borderColor = COLORS.error;
                textColor = COLORS.error;
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
                onPress={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null && selectedAnswer === question.correct}
              >
                <Text style={[styles.optionLetter, { color: textColor }]}>
                  {['A', 'B', 'C', 'D'][idx]}.
                </Text>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {selectedAnswer !== null && idx === question.correct && (
                  <Text style={styles.correctMark}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}

          {selectedAnswer !== null && selectedAnswer === question.correct && (
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <Text style={styles.continueBtnText}>
                {currentQ < questions.length - 1 ? 'Next Question →' : 'See my reward! 🎉'}
              </Text>
            </TouchableOpacity>
          )}

          {selectedAnswer !== null && selectedAnswer !== question.correct && (
            <TouchableOpacity
              style={[styles.tryAgainBtn, { borderColor: colors.primary }]}
              onPress={() => {
                setSelectedAnswer(null);
              }}
            >
              <Text style={[styles.tryAgainText, { color: colors.primary }]}>Try again 🔄</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {step === 'reward' && (
        <View style={styles.rewardContainer}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={[styles.stepDotLine, styles.stepDotLineDone]} />
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={[styles.stepDotLine, styles.stepDotLineDone]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
          </View>

          <Text style={styles.rewardEmoji}>
            {score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '⭐' : '💪'}
          </Text>

          <Text style={[styles.rewardTitle, { color: colors.textPrimary }]}>
            {score >= questions.length * 0.8
              ? 'Excellent Work!'
              : score >= questions.length * 0.5
                ? 'Good Job!'
                : 'Keep Going!'}
          </Text>

          <Text style={[styles.rewardScore, { color: colors.primary }]}>
            {score}/{questions.length} correct
          </Text>

          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{xpEarned} XP earned! ⚡</Text>
          </View>

          {score < questions.length * 0.6 && (
            <View style={styles.adaptationNote}>
              <Text style={styles.adaptationText}>
                🤖 {personality.name} will give you extra help in the chat for this topic!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: colors.primary }]}
            onPress={handleContinueToChat}
          >
            <Text style={styles.continueBtnText}>Chat with {personality.name} 💬</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    alignSelf: 'flex-end',
    padding: SPACING.lg,
  },
  skipText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
  },
  stepContainer: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepDotDone: {
    backgroundColor: COLORS.success,
  },
  stepDotLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
  },
  stepDotLineDone: {
    backgroundColor: COLORS.success,
  },
  stepLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tutorCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  tutorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  tutorEmoji: { fontSize: 40 },
  tutorName: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  tutorRole: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
  },
  lessonTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
  },
  storyText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    lineHeight: 26,
  },
  keyPoints: { gap: SPACING.sm },
  keyPointsLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  keyPointItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  keyPointBullet: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
    marginTop: 2,
  },
  keyPointText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  continueBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  questionCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  subjectTag: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 26,
  },
  hintBox: {
    backgroundColor: '#FEF6E4',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(234,162,33,0.4)',
    gap: SPACING.xs,
  },
  hintTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
    color: '#B87B0A',
  },
  hintText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: '#B87B0A',
    lineHeight: 20,
  },
  simplerBox: {
    backgroundColor: '#E8F5EE',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0,135,81,0.3)',
    gap: SPACING.xs,
  },
  simplerTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
    color: '#005C36',
  },
  simplerText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: '#005C36',
    lineHeight: 20,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
  },
  optionLetter: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Bold',
    width: 24,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  correctMark: {
    fontSize: 16,
    color: '#005C36',
    fontFamily: 'Poppins-Bold',
  },
  tryAgainBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  tryAgainText: {
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.md,
  },
  rewardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  rewardEmoji: { fontSize: 80 },
  rewardTitle: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  rewardScore: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
  },
  xpBadge: {
    backgroundColor: '#FEF6E4',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(234,162,33,0.4)',
  },
  xpBadgeText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    color: '#B87B0A',
  },
  adaptationNote: {
    backgroundColor: '#E8F5EE',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0,135,81,0.3)',
    maxWidth: 320,
  },
  adaptationText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: '#005C36',
    textAlign: 'center',
    lineHeight: 20,
  },
  readAloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
  },
  readAloudIcon: { fontSize: 16 },
  readAloudText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primaryDark,
  },
  readQuestionBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: 4,
    opacity: 0.7,
    zIndex: 1,
  },
});
