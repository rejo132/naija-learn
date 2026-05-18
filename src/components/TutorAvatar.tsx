import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface TutorAvatarProps {
  size?: number;
  personality?: { emoji?: string; color?: string };
}

export function TutorAvatar({
  size = 36,
  personality,
}: TutorAvatarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: personality?.color ?? COLORS.primary,
        },
      ]}
    >
      {/* Learnova L logo mark */}
      <View style={styles.logoMark}>
        <Text
          style={[
            styles.logoLetter,
            { fontSize: size * 0.42 },
          ]}
        >
          L
        </Text>
        <View
          style={[
            styles.logoDot,
            {
              width: size * 0.18,
              height: size * 0.18,
              borderRadius: size * 0.09,
              bottom: size * 0.08,
              right: size * 0.08,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoMark: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    lineHeight: undefined,
  },
  logoDot: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
});
