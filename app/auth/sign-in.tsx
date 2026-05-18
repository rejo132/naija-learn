/**
 * Sign in screen.
 * Parents enter email and password to access their account.
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
import { TutorAvatar } from '@/components/TutorAvatar';

export default function SignInScreen() {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, clearError } = useAuthStore();

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

  async function handleSignIn() {
    if (authMode === 'phone') {
      setError('Phone sign-in is coming soon. Please use email.');
      return;
    }
    if (!email.trim() || !password.trim()) return;
    if (emailError) return;

    setIsLoading(true);
    setError('');
    clearError();
    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch {
      setError('No account found. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  }

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
            <Text style={styles.appTagline}>
              AI-Powered Learning for Nigerian Students
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>Welcome back 🎉</Text>
            <Text style={styles.welcomeSub}>Sign in to continue learning</Text>

            <View style={styles.authToggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, authMode === 'email' && styles.toggleBtnActive]}
                onPress={() => setAuthMode('email')}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    authMode === 'email' && styles.toggleBtnTextActive,
                  ]}
                >
                  📧 Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, authMode === 'phone' && styles.toggleBtnActive]}
                onPress={() => setAuthMode('phone')}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    authMode === 'phone' && styles.toggleBtnTextActive,
                  ]}
                >
                  📱 Phone
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === 'email' && (
              <>
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
                    placeholder="Password"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {authMode === 'phone' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0803 000 0000"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            )}

            <View style={styles.formRow}>
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setKeepSignedIn(!keepSignedIn)}
              >
                <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                  {keepSignedIn && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkLabel}>Keep me signed in</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
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
                <Text style={styles.signInBtnText}>Sign In →</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.privacyNote}>🔐 We never share your data</Text>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} disabled={isLoading}>
                <Text style={styles.socialBtnText}>G  Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} disabled={isLoading}>
                <Text style={styles.socialBtnText}>M  Microsoft</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.signUpLink}
              onPress={() => router.push('/auth/sign-up')}
            >
              <Text style={styles.signUpLinkText}>
                No account?{' '}
                <Text style={styles.signUpLinkBold}>Sign up free</Text>
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
