import { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'flat' | 'glow';
};

export function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'elevated' && styles.elevated,
      variant === 'flat' && styles.flat,
      variant === 'glow' && styles.glow,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.xl,
    ...SHADOWS.soft,
  },
  elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...SHADOWS.medium,
  },
  flat: {
    backgroundColor: COLORS.backgroundGlass,
    borderColor: COLORS.glassBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  glow: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 135, 81, 0.3)',
    ...SHADOWS.glow,
  },
});
