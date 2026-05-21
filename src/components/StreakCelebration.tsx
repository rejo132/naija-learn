import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#FF6B6B',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#FF6FC8',
  '#FF9A3C',
];

const MILESTONES: Record<number, { emoji: string; message: string; title: string }> = {
  3: {
    emoji: '🔥',
    title: '3-Day Streak!',
    message: 'You showed up 3 days in a row!',
  },
  7: {
    emoji: '⚡',
    title: '1 Week Streak!',
    message: 'A full week of learning. Naija champion!',
  },
  14: {
    emoji: '🏅',
    title: '2 Week Streak!',
    message: 'Two weeks strong. You are unstoppable!',
  },
  30: {
    emoji: '👑',
    title: '30-Day Streak!',
    message: 'LEGENDARY. 30 days! Nothing can stop you!',
  },
};

type Props = {
  streak: number;
  onDismiss: () => void;
};

type ConfettiPiece = {
  id: number;
  x: number;
  color: string;
  delay: number;
  anim: Animated.Value;
};

export default function StreakCelebration({ streak, onDismiss }: Props) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const confettiRef = useRef<ConfettiPiece[] | null>(null);
  if (!confettiRef.current) {
    confettiRef.current = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 400,
      anim: new Animated.Value(0),
    }));
  }
  const confetti = confettiRef.current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    confetti.forEach(({ anim, delay }) => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [confetti, onDismiss, opacityAnim, scaleAnim]);

  const milestone = MILESTONES[streak] ?? MILESTONES[3];

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      {confetti.map(({ id, x, color, anim }) => (
        <Animated.View
          key={id}
          style={{
            position: 'absolute',
            left: x,
            top: -20,
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: color,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height + 40],
                }),
              },
              {
                rotate: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '720deg'],
                }),
              },
            ],
          }}
        />
      ))}

      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundCard,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>{milestone.emoji}</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{milestone.title}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{milestone.message}</Text>
        <Text style={[styles.streak, { color: colors.primary }]}>🔥 {streak} day streak</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onDismiss}
        >
          <Text style={styles.buttonText}>Keep Going! 💪</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: '82%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  emoji: { fontSize: 72, marginBottom: 12 },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  streak: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
