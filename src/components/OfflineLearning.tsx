import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { FONT_SIZES, FONT_FAMILY, SPACING, RADIUS } from '@/constants/theme';
import {
  getOfflineQuizzes,
  getOfflineFlashcards,
} from '@/constants/offlineContent';

interface OfflineLearningProps {
  grade: number;
  subject?: string;
  onDismiss: () => void;
}

export function OfflineLearning({ grade, subject, onDismiss }: OfflineLearningProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'menu' | 'quiz' | 'flashcard'>('menu');
  const [quizzes] = useState(() => getOfflineQuizzes(grade, subject));
  const [flashcards] = useState(() => getOfflineFlashcards(grade, subject));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  function handleAnswer(index: number) {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === quizzes[currentIndex].correct) {
      setScore((s) => s + 1);
    }
  }

  function handleNextQuestion() {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      setQuizDone(true);
    }
  }

  function handleNextFlashcard() {
    setFlipped(false);
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 200);
  }

  function resetState() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFlipped(false);
    setQuizDone(false);
  }

  const quiz = quizzes[currentIndex];
  const card = flashcards[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineBadgeText}>📴 {t('offlineTitle')}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {mode === 'menu' && (
        <ScrollView contentContainerStyle={styles.menu}>
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
            🌟 No internet? No problem!
          </Text>
          <Text style={[styles.menuSub, { color: colors.textMuted }]}>
            Keep learning with offline activities
          </Text>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: colors.backgroundCard }]}
            onPress={() => {
              resetState();
              setMode('quiz');
            }}
          >
            <Text style={styles.menuCardEmoji}>🎯</Text>
            <View style={styles.menuCardBody}>
              <Text style={[styles.menuCardTitle, { color: colors.textPrimary }]}>
                {t('offlineQuiz')}
              </Text>
              <Text style={[styles.menuCardSub, { color: colors.textMuted }]}>
                {quizzes.length} questions ready
              </Text>
            </View>
            <Text style={[styles.menuCardArrow, { color: colors.textMuted }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: colors.backgroundCard }]}
            onPress={() => {
              resetState();
              setMode('flashcard');
            }}
          >
            <Text style={styles.menuCardEmoji}>🃏</Text>
            <View style={styles.menuCardBody}>
              <Text style={[styles.menuCardTitle, { color: colors.textPrimary }]}>
                {t('offlineFlashcards')}
              </Text>
              <Text style={[styles.menuCardSub, { color: colors.textMuted }]}>
                {flashcards.length} cards to review
              </Text>
            </View>
            <Text style={[styles.menuCardArrow, { color: colors.textMuted }]}>→</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {mode === 'quiz' && !quizDone && quiz && (
        <ScrollView contentContainerStyle={styles.quizContainer}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              Question {currentIndex + 1} of {quizzes.length}
            </Text>
            <Text style={[styles.scoreText, { color: colors.primary }]}>Score: {score}</Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + 1) / quizzes.length) * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <View style={[styles.questionCard, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>
              {quiz.question}
            </Text>
          </View>

          {quiz.options.map((opt, idx) => {
            let bgColor = colors.backgroundCard;
            let textColor = colors.textPrimary;

            if (selectedOption !== null) {
              if (idx === quiz.correct) {
                bgColor = '#E8F5EE';
                textColor = '#005C36';
              } else if (idx === selectedOption && idx !== quiz.correct) {
                bgColor = '#FDECEA';
                textColor = '#D93025';
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionBtn, { backgroundColor: bgColor, borderColor: colors.border }]}
                onPress={() => handleAnswer(idx)}
                disabled={selectedOption !== null}
              >
                <Text style={[styles.optionLetter, { color: textColor }]}>
                  {['A', 'B', 'C', 'D'][idx]}.
                </Text>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {selectedOption !== null && idx === quiz.correct && (
                  <Text style={styles.optionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}

          {selectedOption !== null && (
            <View style={styles.explanation}>
              <Text style={styles.explanationText}>💡 {quiz.explanation}</Text>
            </View>
          )}

          {selectedOption !== null && (
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.nextBtnText}>
                {currentIndex < quizzes.length - 1 ? 'Next Question →' : 'See Results 🎉'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backToMenu} onPress={() => setMode('menu')}>
            <Text style={[styles.backToMenuText, { color: colors.textMuted }]}>
              ← {t('offlineBack')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {mode === 'quiz' && quizDone && (
        <View style={styles.results}>
          <Text style={styles.resultsEmoji}>
            {score >= quizzes.length * 0.8 ? '🏆' : score >= quizzes.length * 0.5 ? '⭐' : '💪'}
          </Text>
          <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>Quiz Complete!</Text>
          <Text style={[styles.resultsScore, { color: colors.primary }]}>
            {score} / {quizzes.length} correct
          </Text>
          <Text style={[styles.resultsSub, { color: colors.textMuted }]}>
            {score >= quizzes.length * 0.8
              ? 'Excellent work! You are a star! 🌟'
              : score >= quizzes.length * 0.5
                ? 'Good job! Keep practicing!'
                : 'Keep trying! You will get better!'}
          </Text>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              resetState();
              setMode('menu');
            }}
          >
            <Text style={styles.nextBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'flashcard' && card && (
        <View style={styles.flashcardContainer}>
          <Text
            style={[
              styles.progressText,
              { color: colors.textMuted, textAlign: 'center', marginBottom: SPACING.md },
            ]}
          >
            Card {currentIndex + 1} of {flashcards.length}
          </Text>

          <TouchableOpacity
            style={[
              styles.flashcard,
              { backgroundColor: flipped ? colors.primary : colors.backgroundCard },
            ]}
            onPress={() => setFlipped((f) => !f)}
            activeOpacity={0.9}
          >
            <Text style={styles.flashcardEmoji}>{card.emoji}</Text>
            <Text
              style={[
                styles.flashcardText,
                { color: flipped ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              {flipped ? card.back : card.front}
            </Text>
            <Text
              style={[
                styles.flashcardHint,
                { color: flipped ? 'rgba(255,255,255,0.6)' : colors.textMuted },
              ]}
            >
              {flipped ? 'Tap to see question' : 'Tap to reveal answer'}
            </Text>
          </TouchableOpacity>

          <View style={styles.flashcardActions}>
            <TouchableOpacity
              style={[
                styles.fcBtn,
                { backgroundColor: colors.backgroundCard, borderColor: colors.border },
              ]}
              onPress={() => {
                setFlipped(false);
                setCurrentIndex((i) => (i > 0 ? i - 1 : flashcards.length - 1));
              }}
            >
              <Text style={[styles.fcBtnText, { color: colors.textPrimary }]}>← Prev</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fcBtn, { backgroundColor: colors.primary }]}
              onPress={handleNextFlashcard}
            >
              <Text style={[styles.fcBtnText, { color: '#FFFFFF' }]}>Next →</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backToMenu} onPress={() => setMode('menu')}>
            <Text style={[styles.backToMenuText, { color: colors.textMuted }]}>
              ← {t('offlineBack')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  offlineBadge: {
    backgroundColor: '#FEF6E4',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(234,162,33,0.3)',
  },
  offlineBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.semiBold,
    color: '#B87B0A',
  },
  closeBtn: {
    fontSize: 20,
    padding: SPACING.sm,
  },
  menu: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  menuTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  menuSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  menuCardEmoji: { fontSize: 32 },
  menuCardBody: { flex: 1 },
  menuCardTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONT_FAMILY.bold,
  },
  menuCardSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    marginTop: 2,
  },
  menuCardArrow: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
  },
  quizContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
  },
  scoreText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.bold,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONT_FAMILY.semiBold,
    lineHeight: 26,
    textAlign: 'center',
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
    fontFamily: FONT_FAMILY.bold,
    width: 24,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    lineHeight: 20,
  },
  optionCheck: {
    fontSize: FONT_SIZES.lg,
    color: '#005C36',
    fontFamily: FONT_FAMILY.bold,
  },
  explanation: {
    backgroundColor: '#FEF6E4',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(234,162,33,0.3)',
  },
  explanationText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    color: '#B87B0A',
    lineHeight: 20,
  },
  nextBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZES.md,
  },
  backToMenu: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  backToMenuText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
  },
  results: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  resultsEmoji: { fontSize: 72 },
  resultsTitle: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONT_FAMILY.bold,
  },
  resultsScore: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONT_FAMILY.bold,
  },
  resultsSub: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
  flashcardContainer: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  flashcard: {
    width: '100%',
    maxWidth: 360,
    minHeight: 220,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
  flashcardEmoji: { fontSize: 48 },
  flashcardText: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'center',
    lineHeight: 32,
  },
  flashcardHint: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    marginTop: SPACING.sm,
  },
  flashcardActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    maxWidth: 360,
  },
  fcBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  fcBtnText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZES.sm,
  },
});
