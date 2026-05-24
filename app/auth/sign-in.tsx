/**
 * Sign in screen.
 * Parents enter email and password to access their account.
 */
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { signInWithGoogle } from '@/services/oauthService';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { getUIText } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import { TutorAvatar } from '@/components/TutorAvatar';
import { useTheme } from '@/hooks/useTheme';

function mapAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Wrong email or password. Try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please check your email and confirm your account first.';
  }
  if (lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return message
    .replace(/^AuthApiError:\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .trim();
}

const FEATURES = [
  { emoji: '🧠', text: 'Claude AI Tutor' },
  { emoji: '📚', text: 'NERDC Curriculum' },
  { emoji: '🌍', text: '4 Nigerian Languages' },
  { emoji: '📊', text: 'Works Offline' },
  { emoji: '🏆', text: 'Gamified Learning' },
];

export default function SignInScreen() {
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);
  const passwordError = '';
  const setPasswordError = (_s: string) => {};
  const [identifierError, setIdentifierError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthError, setOauthError] = useState('');
  const params = useLocalSearchParams();
  const isOAuthReturn =
    params.oauth === '1';

  const { signIn, clearError, error: authError } = useAuthStore();
  const { t, language } = useTranslation();
  const ui = getUIText(language);
  const { colors } = useTheme();

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const hash = window.location.hash;
    if (!hash.includes('access_token'))
      return;

    // OAuth return detected via hash
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const session =
        useAuthStore.getState().session;
      if (session) {
        clearInterval(interval);
        useAppStore.getState()
          .loadUserProgress()
          .then(() => {
            router.replace('/dashboard');
          })
          .catch(() => {
            router.replace('/dashboard');
          });
      }
      if (attempts >= 20) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: -20,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: 15,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: -10,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float3, {
          toValue: 12,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(float3, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(float3, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeIn, float1, float2, float3]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' &&
        identifier.trim() &&
        password.trim() &&
        !isLoading
      ) {
        handleSignIn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier, password, isLoading]);

  function validateIdentifier(value: string) {
    if (!value.trim()) {
      setIdentifierError('');
      return;
    }
    if (value.includes('@')) {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        setIdentifierError('Please enter a valid email address');
      } else {
        setIdentifierError('');
      }
    } else {
      setIdentifierError('');
    }
  }

  async function handleSignIn() {
    if (!identifier.trim() || !password.trim()) return;
    if (identifierError) return;

    setIsLoading(true);
    setOauthError('');
    clearError();
    try {
      await signIn(identifier.trim(), password);
    } catch {
      // Error shown via authError from store
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setOauthError('');
    clearError();
    const result = await signInWithGoogle();
    setIsLoading(false);
    if (!result.success && result.error !== 'Auth cancelled') {
      setOauthError(result.error ?? 'Google sign in failed');
    }
  }

  // Show spinner while OAuth session
  // is being established
  if (Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.location.hash
        .includes('access_token')) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A1628',
      }}>
        <ActivityIndicator
          size="large"
          color="#1a7a4a"
        />
        <Text style={{
          color: '#FFFFFF',
          marginTop: 16,
          fontSize: 16,
          fontFamily: 'Poppins-Regular',
        }}>
          Signing you in...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {isWide && (
          <Animated.View style={[styles.leftPanel, { opacity: fadeIn }]}>
            <LinearGradient
              colors={['#1A0A2E', '#0D1F14', '#003D25']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <Animated.View
              style={[
                styles.decorCircle1,
                { transform: [{ translateY: float1 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.decorCircle2,
                { transform: [{ translateY: float2 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.decorCircle3,
                { transform: [{ translateY: float3 }] },
              ]}
            />

            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ translateY: float1 }], opacity: fadeIn },
              ]}
            />

            <View style={styles.leftLogo}>
              <TutorAvatar size={56} />
              <Text style={styles.leftAppName}>Learnova</Text>
            </View>

            <View style={styles.featuresList}>
              {FEATURES.map((f, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.featureItem,
                    {
                      opacity: fadeIn,
                      transform: [
                        {
                          translateX: fadeIn.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-30, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.featureEmoji}>{f.emoji}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </Animated.View>
              ))}
            </View>

            <Animated.View style={[styles.quoteBlock, { opacity: fadeIn }]}>
              <Text style={styles.quoteText}>
                &quot;Education is the most powerful weapon&quot;
              </Text>
              <Text style={styles.quoteAuthor}>— Nelson Mandela</Text>
            </Animated.View>
          </Animated.View>
        )}

        <KeyboardAvoidingView
          style={styles.rightPanel}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!isWide && (
              <View style={styles.mobileLogo}>
                <TutorAvatar size={48} />
                <Text style={styles.mobileAppName}>Learnova</Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.welcomeTitle}>{t('welcomeBackAuth')}</Text>
              <Text style={styles.welcomeSub}>{t('signInToContinue')}</Text>

              <Text style={styles.inputLabel}>Email or Username</Text>
              <View
                style={[
                  styles.inputGroup,
                  identifierError ? styles.inputGroupError : null,
                ]}
              >
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === 'web' && {
                      outlineStyle: 'none' as any,
                      outlineWidth: 0,
                    } as any,
                  ]}
                  placeholder="Enter your email or username"
                  placeholderTextColor={COLORS.textMuted}
                  value={identifier}
                  onChangeText={(v) => {
                    setIdentifier(v);
                    validateIdentifier(v);
                    if (authError) clearError();
                    if (oauthError) setOauthError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    passwordRef.current?.focus();
                  }}
                />
              </View>
              {identifierError ? (
                <Text style={styles.fieldError}>{identifierError}</Text>
              ) : null}

              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Poppins-Regular',
                  color: COLORS.textMuted,
                  marginTop: 4,
                  marginBottom: 8,
                }}
              >
                You can sign in with your email or your username
              </Text>

              {/* Password field */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1.5,
                borderRadius: 12,
                borderColor: passwordError
                  ? '#E53935' : '#CCCCCC',
                backgroundColor: '#FFFFFF',
                paddingLeft: 12,
                paddingRight: 4,
                marginBottom: 4,
              }}>
                <Text style={{
                  fontSize: 18,
                  marginRight: 8,
                  color: '#666666',
                }}>🔒</Text>
                <TextInput
                  ref={passwordRef}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#111111',
                    paddingVertical: 14,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (typeof setPasswordError
                      === 'function')
                      setPasswordError('');
                    if (authError) clearError();
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  returnKeyType="go"
                  onSubmitEditing={() => {
                    if (identifier.trim() && password.trim() && !isLoading) {
                      handleSignIn();
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(prev => !prev)}
                  style={{
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  hitSlop={{
                    top: 8, bottom: 8,
                    left: 8, right: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 22,
                    color: '#666666',
                  }}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formRow}>
                <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                  <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
                </TouchableOpacity>
              </View>

              {authError ? (
                <View
                  style={{
                    backgroundColor: '#FFEBEE',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: '#C62828',
                      fontFamily: 'Poppins-Regular',
                      fontSize: 14,
                      textAlign: 'center',
                    }}
                  >
                    ⚠️ {authError}
                  </Text>
                </View>
              ) : null}

              {oauthError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {oauthError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.signInBtn, isLoading && styles.signInBtnLoading]}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signInBtnText}>{t('signIn')} →</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.privacyNote}>{ui.privacyNote}</Text>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('orSignInWith')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Text style={styles.socialBtnText}>G  Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpLink}
                onPress={() => router.push('/auth/sign-up')}
              >
                <Text style={styles.signUpLinkText}>
                  {t('noAccount')}{' '}
                  <Text style={styles.signUpLinkBold}>{t('signUpFree')}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 55,
    position: 'relative',
    overflow: 'hidden',
    padding: SPACING.xxxl,
    justifyContent: 'space-between',
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(100, 60, 180, 0.25)',
    top: -80,
    left: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 80, 40, 0.4)',
    bottom: 100,
    left: 80,
  },
  decorCircle3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(30, 60, 120, 0.3)',
    top: 200,
    right: -40,
  },
  leftLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  leftAppName: {
    fontSize: FONT_SIZES.xxxl,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  featuresList: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.lg,
    marginVertical: SPACING.xxxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureEmoji: { fontSize: 22 },
  featureText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.85)',
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
  },
  quoteText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  rightPanel: {
    flex: 45,
    backgroundColor: '#FFFFFF',
  },
  formScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  mobileLogo: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  mobileAppName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
    gap: SPACING.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  welcomeSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    marginTop: -SPACING.sm,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: { color: COLORS.primary },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 52,
  },
  inputGroupError: { borderColor: COLORS.error },
  inputGroupValid: { borderColor: COLORS.success },
  inputGroupFocused: { borderColor: COLORS.primary },
  passwordGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 52,
    overflow: 'hidden',
    gap: SPACING.sm,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 135, 81, 0.2)',
    top: 20,
    left: 20,
  },
  inputIcon: { fontSize: 18 },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  inputValid: {
    color: COLORS.success,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  eyeIcon: { fontSize: 18, padding: 4 },
  fieldError: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.error,
    marginTop: -SPACING.sm,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  checkLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
  },
  forgotText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primary,
  },
  errorBanner: {
    backgroundColor: COLORS.errorLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.error,
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  signInBtnLoading: { opacity: 0.7 },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  privacyNote: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  socialBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textPrimary,
  },
  signUpLink: { alignItems: 'center' },
  signUpLinkText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
  },
  signUpLinkBold: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
  },
});
