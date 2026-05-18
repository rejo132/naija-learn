/**
 * Toast notification shown when a new achievement is unlocked.
 * Appears at the top of the screen and auto-dismisses after 3 seconds.
 */
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Achievement } from '@/constants/achievements';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!achievement) return;
    
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
      ]).start(() => onDismiss());
    }, 3000);

    return () => clearTimeout(timer);
  }, [achievement, onDismiss, opacity, translateY]);

  if (!achievement) return null;

  return (
    <Animated.View style={[
      styles.toast,
      { opacity, transform: [{ translateY }] }
    ]}>
      <View style={[styles.iconCircle, { backgroundColor: achievement.bgColor }]}>
        <Text style={styles.icon}>{achievement.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>🏅 Achievement Unlocked!</Text>
        <Text style={[styles.title, { color: achievement.color }]}>
          {achievement.title}
        </Text>
        <Text style={styles.description}>{achievement.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  body: { flex: 1 },
  label: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  title: { fontSize: FONT_SIZES.md, fontWeight: '800', marginTop: 2 },
  description: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
});
