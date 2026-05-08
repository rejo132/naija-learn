import { ReactNode } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
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
