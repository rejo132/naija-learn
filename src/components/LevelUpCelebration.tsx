import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  level: number;
  title: string;
  emoji: string;
  onDismiss: () => void;
};

export default function LevelUpCelebration({
  level,
  title,
  emoji,
  onDismiss,
}: Props) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
    }).start();

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    const timer = setTimeout(onDismiss, 4000);
    return () => {
      clearTimeout(timer);
      glowLoop.stop();
    };
  }, [glowAnim, onDismiss, scaleAnim]);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundCard,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.emoji,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.15],
                  }),
                },
              ],
            },
          ]}
        >
          {emoji}
        </Animated.Text>
        <Text style={[styles.levelUp, { color: colors.primary }]}>LEVEL UP!</Text>
        <Text style={[styles.level, { color: colors.textPrimary }]}>Level {level}</Text>
        <Text style={[styles.title, { color: colors.textMuted }]}>
          You are now a{'\n'}
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: 'Poppins-Bold',
            }}
          >
            {title}
          </Text>
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onDismiss}
        >
          <Text style={styles.buttonText}>Let&apos;s Go! 🚀</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: '80%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  emoji: { fontSize: 80, marginBottom: 8 },
  levelUp: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 4,
    marginBottom: 4,
  },
  level: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 28,
  },
  button: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
