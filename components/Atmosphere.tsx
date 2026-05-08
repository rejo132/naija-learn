import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

type AtmosphereProps = {
  variant?: 'home' | 'default';
};

function FloatingAccent({
  size,
  top,
  left,
  right,
  color,
  delay = 0,
}: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  color: string;
  delay?: number;
}) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );
  }, [delay, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.accent,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          right,
          backgroundColor: color,
        },
      ]}
    />
  );
}

export function Atmosphere({ variant = 'default' }: AtmosphereProps) {
  return (
    <View style={styles.root}>
      <View style={styles.gradientTop} />
      <View style={styles.gradientMid} />
      <View style={styles.gradientBottom} />

      <View style={styles.waveOne} />
      <View style={styles.waveTwo} />
      <View style={styles.mapOutline} />

      <Text style={[styles.icon, styles.leafOne]}>🍃</Text>
      <Text style={[styles.icon, styles.leafTwo]}>🌿</Text>
      <Text style={[styles.icon, styles.cloud]}>☁️</Text>
      <Text style={[styles.icon, styles.cap]}>🎓</Text>
      {variant === 'home' ? <Text style={[styles.icon, styles.flag]}>🇳🇬</Text> : null}
      {variant === 'home' ? <Text style={[styles.icon, styles.bridge]}>⛩️</Text> : null}

      <FloatingAccent size={12} top={90} left={64} color="rgba(22,138,75,0.18)" delay={100} />
      <FloatingAccent size={10} top={180} right={110} color="rgba(241,191,74,0.20)" delay={400} />
      <FloatingAccent size={14} top={300} left={28} color="rgba(124,58,237,0.13)" delay={700} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
    zIndex: 0,
    pointerEvents: 'none',
  },
  gradientTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#effbf2',
  },
  gradientMid: {
    ...StyleSheet.absoluteFillObject,
    top: '30%',
    backgroundColor: '#eefbf1',
  },
  gradientBottom: {
    ...StyleSheet.absoluteFillObject,
    top: '62%',
    backgroundColor: '#f9fffb',
  },
  waveOne: {
    position: 'absolute',
    top: 40,
    left: -120,
    width: 360,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(22,138,75,0.15)',
  },
  waveTwo: {
    position: 'absolute',
    bottom: -40,
    right: -130,
    width: 340,
    height: 220,
    borderRadius: 180,
    backgroundColor: 'rgba(22,138,75,0.12)',
  },
  mapOutline: {
    position: 'absolute',
    right: 30,
    bottom: 120,
    width: 120,
    height: 72,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: 'rgba(22,138,75,0.11)',
    transform: [{ rotate: '-8deg' }],
  },
  accent: {
    position: 'absolute',
  },
  icon: {
    position: 'absolute',
    opacity: 0.18,
    fontSize: 20,
  },
  leafOne: { top: 120, right: 22 },
  leafTwo: { top: 210, left: 16 },
  cloud: { top: 66, left: 8 },
  cap: { top: 22, right: 90 },
  flag: { top: 240, left: 12, opacity: 0.13, fontSize: 24 },
  bridge: { top: 178, right: 16, opacity: 0.12, fontSize: 22 },
});
