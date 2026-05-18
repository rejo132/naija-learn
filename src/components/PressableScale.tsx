/**
 * Pressable wrapper with scale-down animation on press.
 *
 * @remarks
 * **Responsible for:** Reusable touch target that shrinks slightly on press-in using
 * Reanimated (`scaleTo` defaults to `0.98`).
 *
 * **Talks to:**
 * - Imports: `react`, `react-native` (`TouchableOpacity`), `react-native-reanimated`.
 * - Exports: `PressableScale` function component.
 * - Used by: `app/index.tsx`, `grade.tsx`, `dashboard.tsx`, `lesson.tsx`.
 *
 * **Notes for new developers:**
 * - Wraps children in `Animated.View` + `TouchableOpacity`; does not forward refs.
 * - `index.tsx` also uses a separate `LanguageCard` with its own scale animation.
 * - Default `activeOpacity` is `0.92` in addition to the scale transform.
 */
import { ReactNode } from 'react';
import { Platform, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type PressableScaleProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  scaleTo?: number;
};

export function PressableScale({
  children,
  onPress,
  style,
  activeOpacity = 0.92,
  scaleTo = 0.98,
}: PressableScaleProps) {
  // Web: use a plain pressable — Reanimated scale wrappers can fail to paint on react-native-web.
  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity style={style} onPress={onPress} activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    );
  }

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={style}
        onPress={onPress}
        activeOpacity={activeOpacity}
        onPressIn={() => {
          scale.value = withTiming(scaleTo, { duration: 120 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 180 });
        }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
