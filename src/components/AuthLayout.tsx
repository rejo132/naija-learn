import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  type TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const FEATURES = [
  '🧠 Claude AI Tutor',
  '📚 NERDC Curriculum',
  '🌍 4 Nigerian Languages',
  '📶 Works Offline',
  '🏆 Gamified Learning',
] as const;

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (value: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animate(float1, 3000);
    animate(float2, 4500);
    animate(float3, 3800);
    animate(glowPulse, 5200);
  }, [float1, float2, float3, glowPulse]);

  const translateY1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const translateY2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });
  const translateY3 = float3.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });
  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isWide && styles.containerWide]}>
        {isWide && (
          <LinearGradient
            colors={['#1a0533', '#2D1B69', '#0d4d3a', '#008751']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.leftPanel}
          >
            <Animated.View
              style={[styles.glowRing, styles.glowRing1, { opacity: glowOpacity }]}
            />
            <Animated.View
              style={[
                styles.orb,
                styles.orb1,
                { transform: [{ translateY: translateY1 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.orb,
                styles.orb2,
                { transform: [{ translateY: translateY2 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.orb,
                styles.orb3,
                { transform: [{ translateY: translateY3 }] },
              ]}
            />

            <View style={styles.waveContainer}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.waveLine,
                    {
                      width: `${60 + i * 10}%` as `${number}%`,
                      opacity: 0.1 + i * 0.05,
                      top: 180 + i * 30,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.brandingContent}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🎓</Text>
              </View>
              <Text style={styles.brandName}>Learnova</Text>
              <Text style={styles.brandTagline}>
                AI-Powered Learning{'\n'}for Nigerian Students
              </Text>

              <View style={styles.featureList}>
                {FEATURES.map((feature) => (
                  <View key={feature} style={styles.featureItem}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.brandQuote}>
                &quot;Education is the most powerful weapon&quot;{'\n'}— Nelson Mandela
              </Text>
            </View>
          </LinearGradient>
        )}

        <LinearGradient
          colors={
            isWide ? ['#FFFFFF', '#FFFFFF'] : ['#1a0533', '#2D1B69', '#0d4d3a', '#008751']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.rightPanel, isWide && styles.rightPanelWide]}
        >
          {!isWide && (
            <View style={styles.mobileBranding}>
              <Text style={styles.mobileLogoEmoji}>🎓</Text>
              <Text style={styles.mobileBrandName}>Learnova</Text>
            </View>
          )}

          <View
            style={[
              styles.formCard,
              isWide && styles.formCardWide,
              !isWide && styles.formCardMobile,
            ]}
          >
            <Text style={[styles.formTitle, !isWide && styles.formTitleLight]}>
              {title}
            </Text>
            <Text style={[styles.formSubtitle, !isWide && styles.formSubtitleLight]}>
              {subtitle}
            </Text>
            {children}
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

export function AuthTextInput(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      style={[authFormStyles.input, focused && authFormStyles.inputFocused, props.style]}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
    />
  );
}

type AuthGradientButtonProps = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
};

export function AuthGradientButton({
  label,
  loading,
  disabled,
  style,
  ...rest
}: AuthGradientButtonProps) {
  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[authFormStyles.btnWrap, disabled && authFormStyles.btnDisabled, style]}
    >
      <LinearGradient
        colors={['#008751', '#00A651']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={authFormStyles.btnGradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={authFormStyles.btnText}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export const authFormStyles = StyleSheet.create({
  formBody: { gap: 0 },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  errorDismiss: {
    color: '#DC2626',
    fontFamily: 'Poppins-Bold',
    paddingLeft: 8,
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#0D2B1A',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: 'rgba(0, 135, 81, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0D2B1A',
    backgroundColor: '#F8FAF9',
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  inputFocused: {
    borderColor: '#008751',
    backgroundColor: '#FFFFFF',
    shadowColor: '#008751',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  btnWrap: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#005C36',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  link: { alignItems: 'center', marginTop: 20, paddingVertical: 4 },
  linkText: {
    color: '#3D6B52',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  linkBold: {
    color: '#008751',
    fontFamily: 'Poppins-Bold',
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, flexDirection: 'column' },
  containerWide: { flexDirection: 'row' },

  leftPanel: {
    flex: 1,
    padding: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  glowRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glowRing1: {
    width: 280,
    height: 280,
    top: '20%',
    right: -80,
  },

  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: '#7C3AED',
    top: -80,
    left: -80,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: '#008751',
    bottom: 100,
    right: -60,
  },
  orb3: {
    width: 150,
    height: 150,
    backgroundColor: '#00BCD4',
    top: '40%',
    left: '30%',
  },

  waveContainer: {
    position: 'absolute',
    width: '100%',
    left: 0,
  },
  waveLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    left: '10%',
  },

  brandingContent: { zIndex: 2 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: { fontSize: 36 },
  brandName: {
    fontSize: 42,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: { gap: 12, marginBottom: 40 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  brandQuote: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  rightPanelWide: {
    flex: 0.8,
  },

  mobileBranding: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mobileLogoEmoji: { fontSize: 48 },
  mobileBrandName: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
  },

  formCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 40,
    elevation: 20,
  },
  formCardWide: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 16,
  },
  formCardMobile: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  formTitle: {
    fontSize: 28,
    color: '#0D2B1A',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  formTitleLight: { color: '#0D2B1A' },
  formSubtitle: {
    fontSize: 14,
    color: '#3D6B52',
    fontFamily: 'Poppins-Regular',
    marginBottom: 24,
  },
  formSubtitleLight: { color: '#3D6B52' },
});
