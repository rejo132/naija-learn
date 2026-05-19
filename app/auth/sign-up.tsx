/**
 * Sign up screen.
 * Parents create an account with email and password.
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
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { getUIText } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import { TutorAvatar } from '@/components/TutorAvatar';

const FEATURES = [
  { emoji: '🧠', text: 'Claude AI Tutor' },
  { emoji: '📚', text: 'NERDC Curriculum' },
  { emoji: '🌍', text: '4 Nigerian Languages' },
  { emoji: '📊', text: 'Works Offline' },
  { emoji: '🏆', text: 'Gamified Learning' },
];

export default function SignUpScreen() {
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { signUp, error: storeError, clearError } = useAuthStore();
  const { t, language } = useTranslation();
  const ui = getUIText(language);

  const phoneRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  const displayError = localError || storeError || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' &&
        name.trim() &&
        email.trim() &&
        password.trim() &&
        confirmPassword.trim() &&
        !isLoading
      ) {
        handleSignUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, password, confirmPassword, isLoading]);

  function validateEmail(value: string) {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!value) {
      setEmailError('');
      setEmailValid(false);
    } else if (!valid) {
      setEmailError('Please enter a valid email address');
      setEmailValid(false);
    } else {
      setEmailError('');
      setEmailValid(true);
    }
  }

  async function handleSignUp() {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return;
    }
    if (emailError || !emailValid) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setLocalError('');
    clearError();
    try {
      await signUp(email.trim(), password, name.trim(), phone.trim());
      router.replace('/dashboard');
    } catch {
      // error is set in the store — shown via displayError
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit =
    name.trim() &&
    phone.trim() &&
    email.trim() &&
    emailValid &&
    password.trim() &&
    confirmPassword.trim() &&
    !isLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {isWide && (
          <View style={styles.leftPanel}>
            <LinearGradient
              colors={['#1A0A2E', '#0D1F14', '#003D25']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />

            <View style={styles.leftLogo}>
              <TutorAvatar size={56} />
              <Text style={styles.leftAppName}>Learnova</Text>
            </View>

            <View style={styles.featuresList}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>{f.emoji}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.quoteBlock}>
              <Text style={styles.quoteText}>
                &quot;Education is the most powerful weapon&quot;
              </Text>
              <Text style={styles.quoteAuthor}>— Nelson Mandela</Text>
            </View>
          </View>
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
              <Text style={styles.welcomeTitle}>{ui.createAccount}</Text>
              <Text style={styles.welcomeSub}>{ui.joinStudents}</Text>

              {displayError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {displayError}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder={ui.fullName}
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    phoneRef.current?.focus();
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  ref={phoneRef}
                  style={styles.input}
                  placeholder="0803 000 0000"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  editable={!isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    emailRef.current?.focus();
                  }}
                />
              </View>

              <View
                style={[
                  styles.inputGroup,
                  emailError
                    ? styles.inputGroupError
                    : emailValid
                      ? styles.inputGroupValid
                      : null,
                ]}
              >
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    validateEmail(v);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    passwordRef.current?.focus();
                  }}
                />
                {emailValid && <Text style={styles.inputValid}>✓</Text>}
              </View>
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

              <View
                style={[
                  styles.passwordGroup,
                  passwordFocused && styles.inputGroupFocused,
                ]}
              >
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  ref={passwordRef}
                  style={styles.passwordInput}
                  placeholder={t('password')}
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  editable={!isLoading}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    confirmPasswordRef.current?.focus();
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.passwordGroup,
                  confirmPasswordFocused && styles.inputGroupFocused,
                ]}
              >
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.passwordInput}
                  placeholder={ui.confirmPassword}
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  editable={!isLoading}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  returnKeyType="go"
                  onSubmitEditing={() => {
                    if (
                      name.trim() &&
                      email.trim() &&
                      password.trim() &&
                      confirmPassword.trim() &&
                      !isLoading
                    ) {
                      handleSignUp();
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.signUpBtn, (isLoading || !canSubmit) && styles.signUpBtnLoading]}
                onPress={handleSignUp}
                disabled={!canSubmit}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signUpBtnText}>{ui.signUp}</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.privacyNote}>{ui.privacyNote}</Text>

              <TouchableOpacity
                style={styles.signInLink}
                onPress={() => router.push('/auth/sign-in')}
              >
                <Text style={styles.signInLinkText}>
                  {ui.alreadyHaveAccount}{' '}
                  <Text style={styles.signInLinkBold}>{ui.signInLink}</Text>
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
  inputIcon: { fontSize: 18 },
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
  signUpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  signUpBtnLoading: { opacity: 0.7 },
  signUpBtnText: {
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
  signInLink: { alignItems: 'center' },
  signInLinkText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
  },
  signInLinkBold: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
  },
});
