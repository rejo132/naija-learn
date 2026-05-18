import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, useMemo } from 'react';
import { COLORS } from '@/constants/theme';

type AtmosphereProps = {
  variant?: 'home' | 'default';
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
};

function FloatingAccent({
  size,
  top,
  left,
  right,
  bottom,
  color,
  delay = 0,
  shape = 'circle',
}: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  color: string;
  delay?: number;
  shape?: 'circle' | 'diamond' | 'ring';
}) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );
  }, [delay, y]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      ...(shape === 'diamond' ? [{ rotate: '45deg' }] : []),
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.accent,
        style,
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? size / 2 : shape === 'ring' ? size / 2 : 4,
          top,
          left,
          right,
          bottom,
          backgroundColor: shape === 'ring' ? 'transparent' : color,
          borderWidth: shape === 'ring' ? 2 : 0,
          borderColor: shape === 'ring' ? color : undefined,
        },
      ]}
    />
  );
}

function DotGrid() {
  const { width, height } = useWindowDimensions();
  const dots = useMemo(() => {
    const cols = Math.ceil(width / 28) + 1;
    const rows = Math.ceil(height / 28) + 1;
    return Array.from({ length: cols * rows }, (_, i) => ({
      key: i,
      left: (i % cols) * 28,
      top: Math.floor(i / cols) * 28,
    }));
  }, [width, height]);

  return (
    <View style={styles.gridLayer} pointerEvents="none">
      {dots.map((dot) => (
        <View
          key={dot.key}
          style={[styles.gridDot, { left: dot.left, top: dot.top }]}
        />
      ))}
    </View>
  );
}

export function Atmosphere({ variant = 'default', pointerEvents = 'none' }: AtmosphereProps) {
  return (
    <View pointerEvents={pointerEvents} style={[styles.root, { pointerEvents: 'none' }]}>
      <View style={styles.gradientTop} />
      <View style={styles.gradientUpper} />
      <View style={styles.gradientMid} />
      <View style={styles.gradientLower} />
      <View style={styles.gradientBottom} />

      <View style={styles.radialGlow} />

      <DotGrid />

      <View style={styles.waveOne} />
      <View style={styles.waveTwo} />
      <View style={styles.waveThree} />
      <View style={styles.mapOutline} />
      <View style={styles.flagStripe} />

      <Text style={[styles.icon, styles.leafOne]}>🍃</Text>
      <Text style={[styles.icon, styles.leafTwo]}>🌿</Text>
      <Text style={[styles.icon, styles.leafThree]}>🍀</Text>
      <Text style={[styles.icon, styles.starOne]}>✦</Text>
      <Text style={[styles.icon, styles.starTwo]}>★</Text>
      <Text style={[styles.icon, styles.starThree]}>✧</Text>
      <Text style={[styles.icon, styles.cloud]}>☁️</Text>
      <Text style={[styles.icon, styles.cap]}>🎓</Text>
      <Text style={[styles.icon, styles.book]}>📚</Text>
      {variant === 'home' ? <Text style={[styles.icon, styles.flag]}>🇳🇬</Text> : null}
      {variant === 'home' ? <Text style={[styles.icon, styles.bridge]}>⛩️</Text> : null}

      <FloatingAccent size={14} top={72} left={48} color={COLORS.primaryGlow} delay={80} />
      <FloatingAccent size={10} top={140} right={72} color="rgba(245, 166, 35, 0.22)" delay={320} />
      <FloatingAccent size={16} top={260} left={20} color="rgba(124, 58, 237, 0.14)" delay={560} />
      <FloatingAccent size={8} top={340} right={36} color={COLORS.primaryGlow} delay={780} />
      <FloatingAccent size={12} bottom={180} left={90} color="rgba(0, 166, 81, 0.16)" delay={440} shape="ring" />
      <FloatingAccent size={18} bottom={100} right={48} color="rgba(245, 166, 35, 0.18)" delay={920} shape="diamond" />
      <FloatingAccent size={6} top={200} left={160} color={COLORS.primaryGlow} delay={1100} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.97,
    zIndex: 0,
    pointerEvents: 'none',
  },
  gradientTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5FBF7',
  },
  gradientUpper: {
    ...StyleSheet.absoluteFillObject,
    top: '12%',
    backgroundColor: COLORS.background,
  },
  gradientMid: {
    ...StyleSheet.absoluteFillObject,
    top: '38%',
    backgroundColor: '#ECF7F0',
  },
  gradientLower: {
    ...StyleSheet.absoluteFillObject,
    top: '68%',
    backgroundColor: COLORS.backgroundDeep,
  },
  gradientBottom: {
    ...StyleSheet.absoluteFillObject,
    top: '88%',
    backgroundColor: '#DCEEDE',
  },
  radialGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.primaryGlow,
    opacity: 0.55,
    transform: [{ scaleX: 1.4 }],
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  gridDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
  },
  waveOne: {
    position: 'absolute',
    top: 24,
    left: -140,
    width: 380,
    height: 200,
    borderRadius: 190,
    backgroundColor: COLORS.primaryGlow,
  },
  waveTwo: {
    position: 'absolute',
    top: '42%',
    right: -160,
    width: 360,
    height: 240,
    borderRadius: 180,
    backgroundColor: 'rgba(0, 135, 81, 0.08)',
  },
  waveThree: {
    position: 'absolute',
    bottom: -60,
    left: -100,
    width: 300,
    height: 200,
    borderRadius: 150,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
  },
  mapOutline: {
    position: 'absolute',
    right: 24,
    bottom: 110,
    width: 128,
    height: 76,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(0, 135, 81, 0.12)',
    transform: [{ rotate: '-8deg' }],
  },
  flagStripe: {
    position: 'absolute',
    left: 32,
    top: '55%',
    width: 4,
    height: 64,
    borderRadius: 2,
    backgroundColor: COLORS.flagGreen,
    opacity: 0.15,
  },
  accent: {
    position: 'absolute',
  },
  icon: {
    position: 'absolute',
    opacity: 0.16,
    fontSize: 20,
    color: COLORS.primaryDark,
  },
  leafOne: { top: 108, right: 28 },
  leafTwo: { top: 198, left: 12 },
  leafThree: { bottom: 220, right: 52, fontSize: 18, opacity: 0.12 },
  starOne: { top: 52, left: 120, fontSize: 14, opacity: 0.2, color: COLORS.accent },
  starTwo: { top: 168, right: 140, fontSize: 12, opacity: 0.18, color: COLORS.accent },
  starThree: { bottom: 160, left: 40, fontSize: 16, opacity: 0.14 },
  cloud: { top: 58, left: 4, fontSize: 22 },
  cap: { top: 18, right: 84 },
  book: { bottom: 280, left: 24, fontSize: 18, opacity: 0.1 },
  flag: { top: 228, left: 8, opacity: 0.14, fontSize: 26 },
  bridge: { top: 168, right: 12, opacity: 0.11, fontSize: 24 },
});
