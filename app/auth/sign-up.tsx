/**
 * Sign up screen.
 * Parents create an account with email and password.
 */
import { useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { getUIText } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import { TutorAvatar } from '@/components/TutorAvatar';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { signUp, error: storeError, clearError } = useAuthStore();
  const { t, language } = useTranslation();
  const ui = getUIText(language);

  const displayError = localError || storeError || '';

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
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <TutorAvatar size={64} />
            <Text style={styles.appName}>Learnova</Text>
            <Text style={styles.appTagline}>{ui.appTagline}</Text>
          </View>

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
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                style={styles.input}
                placeholder="0803 000 0000"
                placeholderTextColor={COLORS.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={!isLoading}
              />
            </View>

            <View style={[styles.inputGroup, emailError ? styles.inputGroupError : null]}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
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
              />
              {emailValid && <Text style={styles.inputValid}>✓</Text>}
            </View>
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder={ui.confirmPassword}
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  keyboard: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  appTagline: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
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
